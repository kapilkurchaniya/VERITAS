"""
NEXUS API — Authentication endpoints.
POST /login  — authenticate and get JWT
GET  /me     — get current user info
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.core.security import verify_password, create_access_token
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.user import UserMe
from app.services.audit import write_audit_log

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(
    body: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Authenticate user with email/password, return JWT token."""
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    role_names = [r.name.value if hasattr(r.name, 'value') else str(r.name) for r in user.roles]
    token = create_access_token(subject=str(user.id), roles=role_names)

    # Audit: login event
    await write_audit_log(
        db,
        actor_id=user.id,
        entity_type="user",
        entity_id=user.id,
        action="login",
        after_state={"email": user.email, "roles": role_names},
    )

    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserMe)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Return the currently authenticated user's profile and roles."""
    return UserMe(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        roles=[r.name.value if hasattr(r.name, 'value') else str(r.name) for r in current_user.roles],
    )
