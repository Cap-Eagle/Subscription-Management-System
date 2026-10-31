from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_permission
from app.permissions import Permission
from app.schemas import TaxCreate, TaxOut, TaxUpdate
from app.services import catalog_service as svc

router = APIRouter(prefix="/taxes", tags=["taxes"])
can_read = Depends(require_permission(Permission.CATALOG_READ))
can_write = Depends(require_permission(Permission.CATALOG_WRITE))


@router.get("", response_model=list[TaxOut], dependencies=[can_read])
def list_taxes(limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    return svc.list_taxes(db, limit, offset)


@router.post("", response_model=TaxOut, status_code=status.HTTP_201_CREATED, dependencies=[can_write])
def create_tax(body: TaxCreate, db: Session = Depends(get_db)):
    return svc.create_tax(db, body)


@router.get("/{tax_id}", response_model=TaxOut, dependencies=[can_read])
def get_tax(tax_id: int, db: Session = Depends(get_db)):
    return svc.get_tax(db, tax_id)


@router.patch("/{tax_id}", response_model=TaxOut, dependencies=[can_write])
def update_tax(tax_id: int, body: TaxUpdate, db: Session = Depends(get_db)):
    """Set or change the rate (rate_percent) and/or the name."""
    return svc.update_tax(db, svc.get_tax(db, tax_id), body)


@router.delete("/{tax_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[can_write])
def delete_tax(tax_id: int, db: Session = Depends(get_db)):
    svc.delete_tax(db, svc.get_tax(db, tax_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
