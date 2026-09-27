"""
NEXUS API — Project management endpoints.
"""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_roles
from app.db.session import get_db
from app.models.user import User
from app.models.project import Project, ProjectMember, ProjectStatus
from app.schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectOut,
    ProjectDetailOut, ProjectMemberAdd, ProjectMemberOut,
)
from app.services.audit import write_audit_log

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post(
    "",
    response_model=ProjectOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("ADMIN"))],
)
async def create_project(
    body: ProjectCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a new project. Admin only."""
    # Check unique code
    existing = await db.execute(select(Project).where(Project.code == body.code))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Project with code '{body.code}' already exists",
        )

    project = Project(
        name=body.name,
        code=body.code,
        description=body.description,
        location=body.location,
    )
    db.add(project)
    await db.flush()
    await db.refresh(project)

    await write_audit_log(
        db,
        actor_id=current_user.id,
        entity_type="project",
        entity_id=project.id,
        action="created",
        after_state={"name": project.name, "code": project.code},
    )

    return ProjectOut(
        id=project.id,
        name=project.name,
        code=project.code,
        description=project.description,
        location=project.location,
        status=project.status.value,
        created_at=project.created_at,
        updated_at=project.updated_at,
        member_count=0,
    )


@router.get("", response_model=list[ProjectOut])
async def list_projects(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    status_filter: str | None = Query(None, alias="status"),
):
    """List projects. Admins see all; others see only assigned projects."""
    user_role_names = {r.name.value if hasattr(r.name, 'value') else str(r.name) for r in current_user.roles}

    query = select(Project)
    if status_filter:
        try:
            ps = ProjectStatus(status_filter)
            query = query.where(Project.status == ps)
        except ValueError:
            pass

    if "ADMIN" not in user_role_names:
        # Non-admins only see projects they are members of
        query = query.join(ProjectMember).where(ProjectMember.user_id == current_user.id)

    query = query.order_by(Project.created_at.desc())
    result = await db.execute(query)
    projects = result.scalars().all()

    out = []
    for p in projects:
        out.append(ProjectOut(
            id=p.id,
            name=p.name,
            code=p.code,
            description=p.description,
            location=p.location,
            status=p.status.value,
            created_at=p.created_at,
            updated_at=p.updated_at,
            member_count=len(p.members),
        ))
    return out


@router.get("/{project_id}", response_model=ProjectDetailOut)
async def get_project(
    project_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get project detail. Checks membership for non-admins."""
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    user_role_names = {r.name.value if hasattr(r.name, 'value') else str(r.name) for r in current_user.roles}
    if "ADMIN" not in user_role_names:
        is_member = any(m.user_id == current_user.id for m in project.members)
        if not is_member:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this project")

    members_out = []
    for m in project.members:
        # Fetch user name
        user_result = await db.execute(select(User).where(User.id == m.user_id))
        user = user_result.scalar_one_or_none()
        members_out.append(ProjectMemberOut(
            id=m.id,
            user_id=m.user_id,
            user_name=user.full_name if user else "Unknown",
            user_email=user.email if user else "",
            role=m.role,
            assigned_at=m.assigned_at,
        ))

    return ProjectDetailOut(
        id=project.id,
        name=project.name,
        code=project.code,
        description=project.description,
        location=project.location,
        status=project.status.value,
        created_at=project.created_at,
        updated_at=project.updated_at,
        member_count=len(project.members),
        members=members_out,
    )


@router.post(
    "/{project_id}/members",
    response_model=ProjectMemberOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("ADMIN"))],
)
async def add_project_member(
    project_id: UUID,
    body: ProjectMemberAdd,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Add a member to a project. Admin only."""
    # Verify project exists
    result = await db.execute(select(Project).where(Project.id == project_id))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")

    # Verify user exists
    user_result = await db.execute(select(User).where(User.id == body.user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    # Check not already a member
    existing = await db.execute(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == body.user_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User is already a member")

    member = ProjectMember(
        project_id=project_id,
        user_id=body.user_id,
        role=body.role,
    )
    db.add(member)
    await db.flush()
    await db.refresh(member)

    await write_audit_log(
        db,
        actor_id=current_user.id,
        entity_type="project_member",
        entity_id=member.id,
        action="added",
        after_state={"project_id": str(project_id), "user_id": str(body.user_id), "role": body.role},
    )

    return ProjectMemberOut(
        id=member.id,
        user_id=member.user_id,
        user_name=user.full_name,
        user_email=user.email,
        role=member.role,
        assigned_at=member.assigned_at,
    )
