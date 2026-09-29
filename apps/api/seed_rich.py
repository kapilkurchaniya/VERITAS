import asyncio
import sys
import os
import uuid
import random
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import select, delete
from app.db.session import async_session_factory
from app.models.user import User
from app.models.project import Project, ProjectStatus
from app.models.schedule import Schedule, ScheduleVersion, Activity, ScheduleStatus
from app.models.execution import ExecutionEvent, EventStatus, SourceType
from app.models.variance import Variance, VarianceType, SeverityLevel


async def seed_rich():
    print("Seeding rich mock data...")
    
    async with async_session_factory() as session:
        # Get users
        admin_user = (await session.execute(select(User).where(User.email == "admin@nexus.dev"))).scalar_one_or_none()
        supervisor_user = (await session.execute(select(User).where(User.email == "supervisor@nexus.dev"))).scalar_one_or_none()
        
        if not admin_user or not supervisor_user:
            print("Users not found. Please run 'python -m app.seed' first.")
            return

        # Create additional projects
        projects_data = [
            {"code": "NMP-A", "name": "NEXUS Metro Package A", "desc": "Metro rail construction package A", "loc": "Mumbai"},
            {"code": "HSR-01", "name": "High Speed Rail - Section 1", "desc": "Viaducts and bridges", "loc": "Gujarat"},
            {"code": "AP-T3", "name": "Airport Terminal 3 Expansion", "desc": "New international terminal", "loc": "Delhi"}
        ]
        
        db_projects = []
        for pdata in projects_data:
            p = (await session.execute(select(Project).where(Project.code == pdata["code"]))).scalar_one_or_none()
            if not p:
                p = Project(name=pdata["name"], code=pdata["code"], description=pdata["desc"], location=pdata["loc"], status=ProjectStatus.ACTIVE)
                session.add(p)
                await session.flush()
                await session.refresh(p)
            db_projects.append(p)
        
        print(f"Created/Found {len(db_projects)} projects.")
        
        # Clear existing execution data to prevent duplicates on rerun
        await session.execute(delete(Variance))
        await session.execute(delete(ExecutionEvent))
        await session.execute(delete(Activity))
        await session.execute(delete(ScheduleVersion))
        await session.execute(delete(Schedule))
        await session.flush()
        
        now = datetime.now(timezone.utc)
        
        for project in db_projects:
            # Create a Schedule
            sched = Schedule(project_id=project.id, name=f"{project.code} Baseline Schedule")
            session.add(sched)
            await session.flush()
            
            # Create a ScheduleVersion
            s_ver = ScheduleVersion(schedule_id=sched.id, version_num=1, status=ScheduleStatus.ACTIVE, imported_by_id=admin_user.id)
            session.add(s_ver)
            await session.flush()
            
            # Create Activities
            activities = []
            for i in range(1, 21):
                planned_start = now - timedelta(days=random.randint(10, 30))
                planned_end = planned_start + timedelta(days=random.randint(5, 15))
                
                act = Activity(
                    schedule_version_id=s_ver.id,
                    activity_code=f"ACT-{i:03d}",
                    name=f"Construction Activity {i} for {project.code}",
                    discipline=random.choice(["Civil", "MEP", "Architectural", "Structural"]),
                    location=random.choice(["Zone A", "Zone B", "Level 1", "Level 2"]),
                    planned_start=planned_start,
                    planned_end=planned_end,
                    quantity=random.choice([100.0, 500.0, 1000.0, 50.0]),
                    unit=random.choice(["cum", "sqm", "RMT", "MT"]),
                )
                session.add(act)
                activities.append(act)
                
            await session.flush()
            for act in activities:
                await session.refresh(act)
                
            # Create Execution Events (some pending, some approved)
            for i in range(1, 11):
                status = random.choice([EventStatus.PENDING_PROCESSING, EventStatus.REVIEW_REQUIRED, EventStatus.APPROVED, EventStatus.MATCHED])
                act = random.choice(activities)
                
                evt = ExecutionEvent(
                    project_id=project.id,
                    reported_by_id=supervisor_user.id,
                    source_type=SourceType.TEXT,
                    raw_input=f"Completed {random.randint(10, 50)} {act.unit} of {act.name}",
                    status=status,
                    matched_activity_id=act.id if status in [EventStatus.APPROVED, EventStatus.MATCHED, EventStatus.REVIEW_REQUIRED] else None,
                    extracted_data={"location": act.location, "progress": f"{random.randint(10,50)}%"},
                    created_at=now - timedelta(days=random.randint(0, 5))
                )
                session.add(evt)
                await session.flush()
                await session.refresh(evt)
                
                # If approved, sometimes create a variance
                if status == EventStatus.APPROVED and random.random() > 0.3:
                    v_type = random.choice([VarianceType.SCHEDULE, VarianceType.QUANTITY, VarianceType.SEQUENCE])
                    severity = random.choice([SeverityLevel.WARNING, SeverityLevel.CRITICAL, SeverityLevel.INFO])
                    
                    v = Variance(
                        project_id=project.id,
                        event_id=evt.id,
                        activity_id=act.id,
                        variance_type=v_type,
                        severity=severity,
                        summary=f"{v_type.value} variance detected for {act.activity_code}",
                        delta_days=random.uniform(-5.0, 15.0) if v_type == VarianceType.SCHEDULE else None,
                        quantity_delta=random.uniform(-50.0, 50.0) if v_type == VarianceType.QUANTITY else None,
                        created_at=evt.created_at
                    )
                    session.add(v)
                    
            print(f"  -> Generated mock data for {project.code}")
            
        await session.commit()
        print("Done seeding rich mock data.")

if __name__ == "__main__":
    asyncio.run(seed_rich())
