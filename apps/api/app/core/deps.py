"""
NEXUS API — FastAPI dependencies.
Provides get_current_user and role-checking dependencies for route protection.
"""
from typing import Annotated
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Extract and validate the current user from the JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()

    if user is None or not user.is_active:
        raise credentials_exception
    return user


def require_roles(*allowed_roles):
    """
    Factory that returns a dependency checking if the current user
    has at least one of the allowed roles.

    Usage:
        @router.get("/admin", dependencies=[Depends(require_roles("ADMIN"))])
    """
    roles = []
    for r in allowed_roles:
        if isinstance(r, (list, tuple)):
            roles.extend(r)
        else:
            roles.append(r)
            
    string_roles = [r.value if hasattr(r, 'value') else r for r in roles]

    async def role_checker(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        user_role_names = {r.name.value if hasattr(r.name, 'value') else r.name for r in current_user.roles}
        if not user_role_names.intersection(set(string_roles)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires one of: {', '.join(string_roles)}",
            )
        return current_user
    return role_checker
