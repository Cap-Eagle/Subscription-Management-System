"""Customer profiles, payment terms and shared billing lookup functions."""
from decimal import Decimal
from sqlalchemy import inspect, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.errors import Conflict, NotFound, Unprocessable
from app.models import Customer, PaymentTerms, Plan, Product, Tax, User, Role
from app.schemas import CustomerProfileCreate, CustomerProfileUpdate, PaymentTermsCreate, PaymentTermsUpdate


def _commit(db: Session, message: str, *objects):
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise Conflict(message) from None
    for obj in objects:
        db.refresh(obj)


def get_customer(db: Session, customer_id: int) -> Customer:
    obj = db.get(Customer, customer_id)
    if obj is None:
        raise NotFound("Customer profile not found")
    return obj


def get_customer_for_user(db: Session, user_id: int) -> Customer | None:
    return db.scalar(select(Customer).where(Customer.user_id == user_id))


def create_customer_profile(db: Session, user: User, data: CustomerProfileCreate) -> Customer:
    if user.role != Role.CUSTOMER:
        raise Unprocessable("Only customer-role users can have a customer profile")
    if get_customer_for_user(db, user.id):
        raise Conflict("A profile already exists for this user")
    obj = Customer(user_id=user.id, **data.model_dump())
    db.add(obj)
    _commit(db, "Customer profile could not be saved", obj)
    return obj


def update_customer_profile(db: Session, obj: Customer, data: CustomerProfileUpdate) -> Customer:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    _commit(db, "Customer profile could not be saved", obj)
    return obj


def get_payment_terms(db: Session, terms_id: int) -> PaymentTerms:
    obj = db.get(PaymentTerms, terms_id)
    if obj is None:
        raise NotFound("Payment terms not found")
    return obj


def list_payment_terms(db: Session, limit: int = 100, offset: int = 0) -> list[PaymentTerms]:
    return list(db.scalars(select(PaymentTerms).order_by(PaymentTerms.id).limit(limit).offset(offset)))


def create_payment_terms(db: Session, data: PaymentTermsCreate) -> PaymentTerms:
    obj = PaymentTerms(**data.model_dump())
    db.add(obj)
    _commit(db, "Payment-term label already exists or data is invalid", obj)
    return obj


def update_payment_terms(db: Session, obj: PaymentTerms, data: PaymentTermsUpdate) -> PaymentTerms:
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)
    _commit(db, "Payment-term label already exists or data is invalid", obj)
    return obj


def delete_payment_terms(db: Session, obj: PaymentTerms) -> None:
    # No subscription/invoice tables are owned by this Member 1 package. Check future tables
    # conservatively when they exist, without coupling this module to Member 2's ORM classes.
    inspector = inspect(db.get_bind())
    for table in ("subscriptions", "invoices"):
        if table in inspector.get_table_names():
            cols = {c["name"] for c in inspector.get_columns(table)}
            fk_col = next((n for n in ("payment_terms_id", "payment_term_id", "terms_id") if n in cols), None)
            if fk_col:
                from sqlalchemy import text
                count = db.execute(text(f'SELECT COUNT(*) FROM "{table}" WHERE "{fk_col}" = :id'), {"id": obj.id}).scalar_one()
                if count:
                    raise Conflict(f"Payment terms are referenced by {table}; cannot delete")
    db.delete(obj)
    _commit(db, "Payment terms are still in use and cannot be deleted")


# Stable SQLAlchemy lookups for billing/services. They deliberately do not depend on HTTP routes.
def get_plan(db: Session, plan_id: int) -> Plan:
    obj = db.get(Plan, plan_id)
    if obj is None:
        raise NotFound("Plan not found")
    return obj


def get_product(db: Session, product_id: int) -> Product:
    obj = db.get(Product, product_id)
    if obj is None:
        raise NotFound("Product not found")
    return obj


def get_tax_rules_for(db: Session, line) -> list[Tax]:
    """Return taxes attached to a line's plan; accepts a plan or an object with plan_id."""
    plan_id = getattr(line, "id", None) if isinstance(line, Plan) else getattr(line, "plan_id", None)
    if plan_id is None:
        raise Unprocessable("Line must be a Plan or expose plan_id")
    plan = get_plan(db, int(plan_id))
    return list(plan.taxes)


def get_payment_terms_lookup(db: Session, terms_id: int) -> PaymentTerms:
    return get_payment_terms(db, terms_id)
