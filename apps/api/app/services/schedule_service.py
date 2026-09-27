import csv
import io
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import UploadFile, HTTPException

from app.models.schedule import Schedule, ScheduleVersion, Activity, ActivityDependency, ScheduleStatus, DependencyType
from app.models.project import Project

class ScheduleService:
    @staticmethod
    def parse_date(date_str: str) -> Optional[datetime]:
        if not date_str:
            return None
        try:
            # Simple fallback format parsing. In a real app we'd use dateutil.
            return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
        except ValueError:
            return None

    @classmethod
    async def import_schedule_csv(
        cls,
        session: AsyncSession,
        project_id: uuid.UUID,
        file: UploadFile,
        user_id: uuid.UUID
    ) -> ScheduleVersion:
        # 1. Verify project exists
        project = await session.get(Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # 2. Get or Create Master Schedule for this project
        result = await session.execute(
            select(Schedule).where(Schedule.project_id == project_id)
        )
        schedule = result.scalars().first()
        if not schedule:
            schedule = Schedule(project_id=project_id, name=f"{project.name} Master Schedule")
            session.add(schedule)
            await session.flush()
        
        # 3. Determine next version number
        v_result = await session.execute(
            select(ScheduleVersion)
            .where(ScheduleVersion.schedule_id == schedule.id)
            .order_by(ScheduleVersion.version_num.desc())
        )
        last_version = v_result.scalars().first()
        next_version_num = (last_version.version_num + 1) if last_version else 1
        
        # 4. Create new ScheduleVersion
        new_version = ScheduleVersion(
            schedule_id=schedule.id,
            version_num=next_version_num,
            source_file_name=file.filename,
            imported_by_id=user_id,
            status=ScheduleStatus.ACTIVE
        )
        session.add(new_version)
        await session.flush()

        # Archive old active version
        if last_version:
            last_version.status = ScheduleStatus.ARCHIVED

        # 5. Read CSV
        content = await file.read()
        text = content.decode('utf-8')
        reader = csv.DictReader(io.StringIO(text))
        
        activities_data = []
        dependencies_data = [] # List of tuples: (successor_code, predecessor_code, type)

        # To build hierarchy
        code_to_id = {}

        for row in reader:
            # Normalize keys by stripping and lowercasing
            row_norm = {k.strip().lower(): v.strip() for k, v in row.items() if k}
            
            activity_code = row_norm.get("activity_code") or row_norm.get("code")
            name = row_norm.get("name") or row_norm.get("activity_name")
            
            if not activity_code or not name:
                continue
                
            activity = Activity(
                id=uuid.uuid4(),
                schedule_version_id=new_version.id,
                activity_code=activity_code,
                name=name,
                wbs_level=row_norm.get("wbs_level"),
                discipline=row_norm.get("discipline"),
                location=row_norm.get("location"),
                planned_start=cls.parse_date(row_norm.get("planned_start")),
                planned_end=cls.parse_date(row_norm.get("planned_end")),
            )
            
            qty = row_norm.get("quantity")
            if qty:
                try:
                    activity.quantity = float(qty)
                except ValueError:
                    pass
            activity.unit = row_norm.get("unit")
            
            session.add(activity)
            code_to_id[activity_code] = activity.id
            
            # Dependencies
            preds = row_norm.get("predecessors", "")
            if preds:
                # expecting comma separated e.g. "A100, B200"
                for p in preds.split(","):
                    p_code = p.strip()
                    if p_code:
                        dependencies_data.append((activity_code, p_code, DependencyType.FS))
        
        await session.flush()
        
        # 6. Insert Dependencies
        for succ_code, pred_code, dep_type in dependencies_data:
            succ_id = code_to_id.get(succ_code)
            pred_id = code_to_id.get(pred_code)
            if succ_id and pred_id:
                dep = ActivityDependency(
                    predecessor_id=pred_id,
                    successor_id=succ_id,
                    dependency_type=dep_type,
                    lag=0.0
                )
                session.add(dep)
        
        await session.commit()
        await session.refresh(new_version)
        return new_version
