"""Products, variants, plans and taxes: create/read/update/delete plus the rules that keep them consistent.

Relationship rules:
  * A variant belongs to one product and cannot be moved to another.
  * Deleting a product deletes its variants, but is refused while any plan uses the product.
  * A variant that a plan uses cannot be deleted.
  * A plan's variant must belong to the plan's product (also enforced by a composite foreign key).
  * A tax that is attached to a plan cannot be deleted; changing its rate is always allowed.
  * Deleting a plan removes its tax links, not the taxes.
"""
from datetime import date

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.errors import Conflict, NotFound, Unprocessable
from app.models import Plan, Product, ProductVariant, Tax, plan_taxes
from app.schemas import (
    PlanCreate,
    PlanUpdate,
    ProductCreate,
    ProductUpdate,
    TaxCreate,
    TaxUpdate,
    VariantCreate,
    VariantUpdate,
)


def _commit(db: Session, conflict_message: str, *saved: object) -> None:
    """Commit, turning a database constraint failure into a 409.

    Objects passed in `saved` are reloaded afterwards, so the response shows exactly what was stored
    (for example prices normalised to two decimals) rather than what the client sent.
    """
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise Conflict(conflict_message) from None
    for obj in saved:
        db.refresh(obj)


def _count(db: Session, query) -> int:
    return db.scalar(select(func.count()).select_from(query.subquery())) or 0


# --- products -------------------------------------------------------------------------------

def get_product(db: Session, product_id: int) -> Product:
    product = db.get(Product, product_id)
    if product is None:
        raise NotFound("Product not found")
    return product


def list_products(db: Session, limit: int, offset: int) -> list[Product]:
    return list(db.scalars(select(Product).order_by(Product.id).limit(limit).offset(offset)))


def create_product(db: Session, data: ProductCreate) -> Product:
    product = Product(**data.model_dump())
    db.add(product)
    _commit(db, "Product could not be saved", product)
    return product


def update_product(db: Session, product: Product, data: ProductUpdate) -> Product:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    _commit(db, "Product could not be saved", product)
    return product


def delete_product(db: Session, product: Product) -> None:
    plan_count = _count(db, select(Plan.id).where(Plan.product_id == product.id))
    if plan_count:
        raise Conflict(f"Product is used by {plan_count} plan(s); delete or reassign them first")
    db.delete(product)  # its variants go with it (ON DELETE CASCADE)
    _commit(db, "Product is still in use and cannot be deleted")


# --- variants -------------------------------------------------------------------------------

def get_variant(db: Session, variant_id: int) -> ProductVariant:
    variant = db.get(ProductVariant, variant_id)
    if variant is None:
        raise NotFound("Variant not found")
    return variant


def list_variants(db: Session, product_id: int) -> list[ProductVariant]:
    get_product(db, product_id)  # 404 if the product does not exist
    return list(db.scalars(select(ProductVariant).where(ProductVariant.product_id == product_id).order_by(ProductVariant.id)))


def create_variant(db: Session, product_id: int, data: VariantCreate) -> ProductVariant:
    get_product(db, product_id)  # a variant needs an existing product: 404 otherwise
    variant = ProductVariant(product_id=product_id, **data.model_dump())
    db.add(variant)
    _commit(db, "This product already has a variant with that attribute and value", variant)
    return variant


def update_variant(db: Session, variant: ProductVariant, data: VariantUpdate) -> ProductVariant:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(variant, field, value)
    _commit(db, "This product already has a variant with that attribute and value", variant)
    return variant


def delete_variant(db: Session, variant: ProductVariant) -> None:
    plan_count = _count(db, select(Plan.id).where(Plan.variant_id == variant.id))
    if plan_count:
        raise Conflict(f"Variant is used by {plan_count} plan(s); delete or reassign them first")
    db.delete(variant)
    _commit(db, "Variant is still in use and cannot be deleted")


# --- taxes ----------------------------------------------------------------------------------

def get_tax(db: Session, tax_id: int) -> Tax:
    tax = db.get(Tax, tax_id)
    if tax is None:
        raise NotFound("Tax not found")
    return tax


def list_taxes(db: Session, limit: int, offset: int) -> list[Tax]:
    return list(db.scalars(select(Tax).order_by(Tax.id).limit(limit).offset(offset)))


def create_tax(db: Session, data: TaxCreate) -> Tax:
    tax = Tax(**data.model_dump())
    db.add(tax)
    _commit(db, "A tax with that name already exists", tax)
    return tax


def update_tax(db: Session, tax: Tax, data: TaxUpdate) -> Tax:
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(tax, field, value)
    _commit(db, "A tax with that name already exists", tax)
    return tax


def delete_tax(db: Session, tax: Tax) -> None:
    plan_count = _count(db, select(plan_taxes.c.plan_id).where(plan_taxes.c.tax_id == tax.id))
    if plan_count:
        raise Conflict(f"Tax is attached to {plan_count} plan(s); detach it first")
    db.delete(tax)
    _commit(db, "Tax is still in use and cannot be deleted")


# --- plans ----------------------------------------------------------------------------------

def get_plan(db: Session, plan_id: int) -> Plan:
    plan = db.get(Plan, plan_id)
    if plan is None:
        raise NotFound("Plan not found")
    return plan


def list_plans(db: Session, limit: int, offset: int) -> list[Plan]:
    return list(db.scalars(select(Plan).order_by(Plan.id).limit(limit).offset(offset)))


def _check_product_and_variant(db: Session, product_id: int, variant_id: int | None) -> None:
    if db.get(Product, product_id) is None:
        raise Unprocessable("product_id does not refer to an existing product")
    if variant_id is not None:
        variant = db.get(ProductVariant, variant_id)
        if variant is None:
            raise Unprocessable("variant_id does not refer to an existing variant")
        if variant.product_id != product_id:
            raise Unprocessable("variant_id does not belong to the plan's product")


def _check_availability(available_from: date | None, available_to: date | None) -> None:
    if available_from and available_to and available_from > available_to:
        raise Unprocessable("available_from must not be after available_to")


def _resolve_taxes(db: Session, tax_ids: list[int]) -> list[Tax]:
    wanted = set(tax_ids)
    taxes = list(db.scalars(select(Tax).where(Tax.id.in_(wanted)).order_by(Tax.id))) if wanted else []
    missing = wanted - {t.id for t in taxes}
    if missing:
        raise Unprocessable(f"Unknown tax id(s): {sorted(missing)}")
    return taxes


def create_plan(db: Session, data: PlanCreate) -> Plan:
    _check_product_and_variant(db, data.product_id, data.variant_id)
    _check_availability(data.available_from, data.available_to)
    taxes = _resolve_taxes(db, data.tax_ids)

    plan = Plan(**data.model_dump(exclude={"tax_ids"}))
    plan.taxes = taxes
    db.add(plan)
    _commit(db, "Plan could not be saved because a related record changed", plan)
    return plan


def update_plan(db: Session, plan: Plan, data: PlanUpdate) -> Plan:
    changes = data.model_dump(exclude_unset=True)
    tax_ids = changes.pop("tax_ids", None)

    # Validate the plan as it will look after the update, before touching the loaded object.
    product_id = changes.get("product_id", plan.product_id)
    variant_id = changes["variant_id"] if "variant_id" in changes else plan.variant_id
    _check_product_and_variant(db, product_id, variant_id)
    _check_availability(
        changes["available_from"] if "available_from" in changes else plan.available_from,
        changes["available_to"] if "available_to" in changes else plan.available_to,
    )
    taxes = _resolve_taxes(db, tax_ids) if tax_ids is not None else None

    for field, value in changes.items():
        setattr(plan, field, value)
    if taxes is not None:
        plan.taxes = taxes
    _commit(db, "Plan could not be saved because a related record changed", plan)
    return plan


def delete_plan(db: Session, plan: Plan) -> None:
    db.delete(plan)  # plan_taxes rows go with it; the taxes themselves stay
    _commit(db, "Plan is still in use and cannot be deleted")
