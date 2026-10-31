"""Adapters from SQLAlchemy platform records to plain billing contracts.

The billing engine's calculation layer should consume these dataclasses, not ORM objects.
IDs are strings to match the existing billing contract convention.
"""
from dataclasses import dataclass
from decimal import Decimal
from app.models import Plan, Product, Tax, Customer, PaymentTerms


@dataclass(frozen=True)
class BillingPlan:
    id: str
    name: str
    product_id: str
    variant_id: str | None
    price: Decimal
    billing_period: str
    min_quantity: int
    auto_close_at_end: bool
    closable_early: bool
    pausable: bool
    renewable: bool


@dataclass(frozen=True)
class BillingProduct:
    id: str
    name: str
    type: str
    sales_price: Decimal
    cost_price: Decimal


@dataclass(frozen=True)
class BillingTax:
    id: str
    name: str
    rate_percent: Decimal


@dataclass(frozen=True)
class BillingCustomer:
    id: str
    user_id: str
    name: str
    address_line1: str
    address_line2: str | None
    city: str
    state: str
    postal_code: str
    country: str


@dataclass(frozen=True)
class BillingPaymentTerms:
    id: str
    label: str
    days_until_due: int


def plan_to_billing(plan: Plan) -> BillingPlan:
    return BillingPlan(str(plan.id), plan.name, str(plan.product_id),
                       str(plan.variant_id) if plan.variant_id is not None else None,
                       Decimal(plan.price), plan.billing_period.value, plan.min_quantity,
                       bool(plan.auto_close), bool(plan.allow_early_close),
                       bool(plan.allow_pause), bool(plan.allow_renew))


def product_to_billing(product: Product) -> BillingProduct:
    return BillingProduct(str(product.id), product.name, product.type,
                          Decimal(product.sales_price), Decimal(product.cost_price))


def tax_to_billing(tax: Tax) -> BillingTax:
    return BillingTax(str(tax.id), tax.name, Decimal(tax.rate_percent))


def customer_to_billing(customer: Customer) -> BillingCustomer:
    return BillingCustomer(str(customer.id), str(customer.user_id), customer.name,
                           customer.address_line1, customer.address_line2, customer.city,
                           customer.state, customer.postal_code, customer.country)


def payment_terms_to_billing(terms: PaymentTerms) -> BillingPaymentTerms:
    return BillingPaymentTerms(str(terms.id), terms.label, terms.days_until_due)
