from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, require_permission
from app.errors import Forbidden, NotFound
from app.models import User, Role
from app.permissions import Permission
from app.schemas import CustomerProfileCreate, CustomerProfileOut, CustomerProfileUpdate
from app.services import member1_service as svc

router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("/me", response_model=CustomerProfileOut, status_code=status.HTTP_201_CREATED)
def create_my_profile(body: CustomerProfileCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role != Role.CUSTOMER:
        raise Forbidden("Only customers can create a customer profile")
    return svc.create_customer_profile(db, user, body)


@router.get("/me", response_model=CustomerProfileOut)
def get_my_profile(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role != Role.CUSTOMER:
        raise Forbidden("This endpoint is for customer accounts")
    obj = svc.get_customer_for_user(db, user.id)
    if obj is None:
        raise NotFound("Customer profile not found; create it first")
    return obj


@router.patch("/me", response_model=CustomerProfileOut)
def update_my_profile(body: CustomerProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if user.role != Role.CUSTOMER:
        raise Forbidden("This endpoint is for customer accounts")
    obj = svc.get_customer_for_user(db, user.id)
    if obj is None:
        raise NotFound("Customer profile not found; create it first")
    return svc.update_customer_profile(db, obj, body)


@router.get("/{customer_id}", response_model=CustomerProfileOut, dependencies=[Depends(require_permission(Permission.CATALOG_WRITE))])
def admin_get_customer(customer_id: int, db: Session = Depends(get_db)):
    return svc.get_customer(db, customer_id)
