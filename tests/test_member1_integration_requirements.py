"""Additional integration coverage for README handoff requirements."""
from decimal import Decimal
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
import pytest

from app.errors import Conflict, NotFound
from app.models import Customer, PaymentTerms, Plan, Product, Tax, Role
from app.schemas import CustomerProfileCreate, PaymentTermsCreate
from app.services import member1_service as svc
from app.services.billing_adapters import (
    customer_to_billing, payment_terms_to_billing, plan_to_billing,
    product_to_billing, tax_to_billing,
)
from app.services.auth_service import register_user
from tests.conftest import PASSWORD

PROFILE = {
    "name": "Ada Customer", "address_line1": "1 Main Road", "address_line2": "Suite 2",
    "city": "Kochi", "state": "Kerala", "postal_code": "682001", "country": "India"
}


def test_lookup_services_and_all_contract_mappings(db):
    user = register_user(db, "lookup-customer@example.com", PASSWORD, Role.CUSTOMER)
    customer = svc.create_customer_profile(db, user, CustomerProfileCreate(**PROFILE))
    product = Product(name="Product", type="subscription", sales_price=Decimal("100.00"), cost_price=Decimal("25.00"))
    tax = Tax(name="GST", rate_percent=Decimal("18.00"))
    db.add_all([product, tax]); db.commit(); db.refresh(product); db.refresh(tax)
    plan = Plan(name="Monthly", product_id=product.id, price=Decimal("100.00"), billing_period="monthly",
                min_quantity=1, auto_close=True, allow_early_close=True, allow_pause=True, allow_renew=False, taxes=[tax])
    db.add(plan); db.commit(); db.refresh(plan)
    terms = svc.create_payment_terms(db, PaymentTermsCreate(label="Net 15", days_until_due=15))

    assert svc.get_customer(db, customer.id).user_id == user.id
    assert svc.get_plan(db, plan.id).id == plan.id
    assert svc.get_product(db, product.id).id == product.id
    assert svc.get_tax_rules_for(db, plan)[0].id == tax.id
    assert svc.get_tax_rules_for(db, type("Line", (), {"plan_id": plan.id})())[0].id == tax.id
    assert svc.get_payment_terms(db, terms.id).id == terms.id

    assert plan_to_billing(plan).auto_close_at_end is True
    assert plan_to_billing(plan).closable_early is True
    assert plan_to_billing(plan).pausable is True
    assert plan_to_billing(plan).renewable is False
    assert product_to_billing(product).sales_price == Decimal("100.00")
    assert tax_to_billing(tax).rate_percent == Decimal("18.00")
    assert customer_to_billing(customer).id == str(customer.id)
    assert payment_terms_to_billing(terms).days_until_due == 15


def test_payment_term_delete_is_blocked_when_referenced(db):
    from sqlalchemy import inspect

    terms = svc.create_payment_terms(
        db, PaymentTermsCreate(label="Net 30", days_until_due=30)
    )

    inspector = inspect(db.get_bind())
    if "payment_terms_id" not in {
        column["name"]
        for column in inspector.get_columns("invoices")
    }:
        db.execute(text(
            "ALTER TABLE invoices ADD COLUMN payment_terms_id INTEGER"
        ))

    # Defer FK checks: this test targets the payment-term reference guard,
    # not subscription/customer creation.
    db.execute(text("PRAGMA defer_foreign_keys=ON"))

    columns = {
        column["name"]: column
        for column in inspector.get_columns("invoices")
    }

    values = {"payment_terms_id": terms.id}
    for name, column in columns.items():
        if name in values or name == "id" or column["nullable"]:
            continue

        kind = str(column["type"]).upper()
        if name.endswith("_id"):
            values[name] = 1
        elif "DATE" in kind:
            values[name] = "2026-01-01"
        elif "TIME" in kind:
            values[name] = "2026-01-01 00:00:00"
        elif any(token in kind for token in ("INT", "NUMERIC", "DECIMAL", "FLOAT")):
            values[name] = 0
        elif "BOOL" in kind:
            values[name] = False
        else:
            values[name] = "draft" if name == "status" else "TEST"

    names = ", ".join(f'"{name}"' for name in values)
    params = ", ".join(f":{name}" for name in values)
    db.execute(
        text(f"INSERT INTO invoices ({names}) VALUES ({params})"),
        values,
    )

    with pytest.raises(Exception):
        svc.delete_payment_terms(db, terms.id)

def test_lookup_functions_return_not_found(db):
    for fn, args in ((svc.get_customer, (1,)), (svc.get_plan, (1,)), (svc.get_product, (1,)),
                     (svc.get_payment_terms, (1,))):
        with pytest.raises(NotFound):
            fn(db, *args)
