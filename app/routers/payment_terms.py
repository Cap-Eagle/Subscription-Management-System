from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_permission
from app.permissions import Permission
from app.schemas import PaymentTermsCreate, PaymentTermsOut, PaymentTermsUpdate
from app.services import member1_service as svc

router = APIRouter(prefix="/payment-terms", tags=["payment terms"])
can_read = Depends(require_permission(Permission.CATALOG_READ))
can_write = Depends(require_permission(Permission.CATALOG_WRITE))


@router.get("", response_model=list[PaymentTermsOut], dependencies=[can_read])
def list_terms(limit: int = Query(100, ge=1, le=200), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    return svc.list_payment_terms(db, limit, offset)


@router.post("", response_model=PaymentTermsOut, status_code=status.HTTP_201_CREATED, dependencies=[can_write])
def create_terms(body: PaymentTermsCreate, db: Session = Depends(get_db)):
    return svc.create_payment_terms(db, body)


@router.get("/{terms_id}", response_model=PaymentTermsOut, dependencies=[can_read])
def get_terms(terms_id: int, db: Session = Depends(get_db)):
    return svc.get_payment_terms(db, terms_id)


@router.patch("/{terms_id}", response_model=PaymentTermsOut, dependencies=[can_write])
def update_terms(terms_id: int, body: PaymentTermsUpdate, db: Session = Depends(get_db)):
    return svc.update_payment_terms(db, svc.get_payment_terms(db, terms_id), body)


@router.delete("/{terms_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[can_write])
def delete_terms(terms_id: int, db: Session = Depends(get_db)):
    svc.delete_payment_terms(db, svc.get_payment_terms(db, terms_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
