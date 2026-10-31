"""Authentication and authorization dependencies. Every protected route goes through these."""
from collections.abc import Callable

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database import get_db
from app.errors import Forbidden, Unauthorized
from app.models import User
from app.permissions import Permission, has_permission
from app.security import decode_access_token

bearer_scheme = HTTPBearer(auto_error=False)  # auto_error off so a missing token is a 401 (not 403)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> User:
    if credentials is None:
        raise Unauthorized()
    user = db.get(User, decode_access_token(credentials.credentials, settings))
    if user is None:
        raise Unauthorized("Invalid or expired token")
    return user


def require_permission(permission: Permission) -> Callable[..., User]:
    """Dependency factory: 401 if not signed in, 403 if the user's role lacks the permission."""

    def checker(user: User = Depends(get_current_user)) -> User:
        if not has_permission(user.role, permission):
            raise Forbidden()
        return user

    return checker
