from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_permission
from app.permissions import Permission
from app.schemas import ProductCreate, ProductOut, ProductUpdate, VariantCreate, VariantOut
from app.services import catalog_service as svc

router = APIRouter(prefix="/products", tags=["products"])
can_read = Depends(require_permission(Permission.CATALOG_READ))
can_write = Depends(require_permission(Permission.CATALOG_WRITE))


@router.get("", response_model=list[ProductOut], dependencies=[can_read])
def list_products(limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0), db: Session = Depends(get_db)):
    return svc.list_products(db, limit, offset)


@router.post("", response_model=ProductOut, status_code=status.HTTP_201_CREATED, dependencies=[can_write])
def create_product(body: ProductCreate, db: Session = Depends(get_db)):
    return svc.create_product(db, body)


@router.get("/{product_id}", response_model=ProductOut, dependencies=[can_read])
def get_product(product_id: int, db: Session = Depends(get_db)):
    return svc.get_product(db, product_id)


@router.patch("/{product_id}", response_model=ProductOut, dependencies=[can_write])
def update_product(product_id: int, body: ProductUpdate, db: Session = Depends(get_db)):
    return svc.update_product(db, svc.get_product(db, product_id), body)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[can_write])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    svc.delete_product(db, svc.get_product(db, product_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Variants are created and listed under their product; a missing product is a 404.
@router.get("/{product_id}/variants", response_model=list[VariantOut], dependencies=[can_read])
def list_variants(product_id: int, db: Session = Depends(get_db)):
    return svc.list_variants(db, product_id)


@router.post(
    "/{product_id}/variants", response_model=VariantOut, status_code=status.HTTP_201_CREATED, dependencies=[can_write]
)
def create_variant(product_id: int, body: VariantCreate, db: Session = Depends(get_db)):
    return svc.create_variant(db, product_id, body)
