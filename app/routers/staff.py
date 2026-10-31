from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_permission
from app.models import Role
from app.permissions import Permission
from app.schemas import StaffCreateIn, UserOut
from app.services import auth_service

router = APIRouter(prefix="/staff", tags=["staff"])


@router.post(
    "",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission(Permission.STAFF_CREATE))],  # admin only, enforced here on the server
)
def create_staff(body: StaffCreateIn, db: Session = Depends(get_db)):
    return auth_service.register_user(db, body.email, body.password, Role.STAFF)
