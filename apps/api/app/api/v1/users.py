"""
NEXUS API — User management endpoints.
Admin-only user creation and listing.
"""
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, require_roles
from app.core.security import hash_password
from app.db.session import get_db
from app.models.user import User, Role, RoleName
from app.schemas.user import UserCreate, UserOut, UserUpdate
from app.services.audit import write_audit_log

router = APIRouter(prefix="/users", tags=["Users"])


@router.post(
    "",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("ADMIN"))],
)
async def create_user(
    body: UserCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a new user. Admin only."""
    # Check if email already exists
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        )

    # Resolve role names to Role objects
    roles = []
    for rn in body.role_names:
        try:
            role_enum = RoleName(rn)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role: {rn}. Valid: {[r.value for r in RoleName]}",
            )
        result = await db.execute(select(Role).where(Role.name == role_enum))
        role = result.scalar_one_or_none()
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Role '{rn}' not found in database. Run seed first.",
            )
        roles.append(role)

    user = User(
        email=body.email,
        full_name=body.full_name,
        hashed_password=hash_password(body.password),
        roles=roles,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    # Audit
    await write_audit_log(
        db,
        actor_id=current_user.id,
        entity_type="user",
        entity_id=user.id,
        action="created",
        after_state={"email": user.email, "roles": body.role_names},
    )

    return user


@router.get(
    "",
    response_model=list[UserOut],
    dependencies=[Depends(require_roles("ADMIN"))],
)
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """List all users. Admin only."""
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.get(
    "/{user_id}",
    response_model=UserOut,
    dependencies=[Depends(require_roles("ADMIN"))],
)
async def get_user(
    user_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get a single user by ID. Admin only."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
