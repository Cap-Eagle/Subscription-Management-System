from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_permission
from app.permissions import Permission
from app.schemas import PlanCreate, PlanOut, PlanUpdate
from app.services import catalog_service as svc

router = APIRouter(prefix="/plans", tags=["plans"])
can_read = Depends(require_permission(Permission.CATALOG_READ))
can_write = Depends(require_permission(Permission.CATALOG_WRITE))


@router.get("", response_model=list[PlanOut], dependencies=[can_read])
def list_plans(limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    return svc.list_plans(db, limit, offset)


@router.post("", response_model=PlanOut, status_code=status.HTTP_201_CREATED, dependencies=[can_write])
def create_plan(body: PlanCreate, db: Session = Depends(get_db)):
    return svc.create_plan(db, body)


@router.get("/{plan_id}", response_model=PlanOut, dependencies=[can_read])
def get_plan(plan_id: int, db: Session = Depends(get_db)):
    return svc.get_plan(db, plan_id)


@router.patch("/{plan_id}", response_model=PlanOut, dependencies=[can_write])
def update_plan(plan_id: int, body: PlanUpdate, db: Session = Depends(get_db)):
    return svc.update_plan(db, svc.get_plan(db, plan_id), body)


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[can_write])
def delete_plan(plan_id: int, db: Session = Depends(get_db)):
    svc.delete_plan(db, svc.get_plan(db, plan_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
