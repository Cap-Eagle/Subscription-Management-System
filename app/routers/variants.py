from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_permission
from app.permissions import Permission
from app.schemas import VariantOut, VariantUpdate
from app.services import catalog_service as svc

router = APIRouter(prefix="/variants", tags=["variants"])
can_read = Depends(require_permission(Permission.CATALOG_READ))
can_write = Depends(require_permission(Permission.CATALOG_WRITE))


@router.get("/{variant_id}", response_model=VariantOut, dependencies=[can_read])
def get_variant(variant_id: int, db: Session = Depends(get_db)):
    return svc.get_variant(db, variant_id)


@router.patch("/{variant_id}", response_model=VariantOut, dependencies=[can_write])
def update_variant(variant_id: int, body: VariantUpdate, db: Session = Depends(get_db)):
    return svc.update_variant(db, svc.get_variant(db, variant_id), body)


@router.delete("/{variant_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[can_write])
def delete_variant(variant_id: int, db: Session = Depends(get_db)):
    svc.delete_variant(db, svc.get_variant(db, variant_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
