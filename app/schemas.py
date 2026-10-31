"""Request/response schemas."""
from datetime import date, datetime
from decimal import Decimal
from typing import Annotated, ClassVar

from pydantic import (
    AfterValidator,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)

from app.models import BillingPeriod, Role
from app.security import PASSWORD_MAX_LENGTH, validate_password_strength

StrongPassword = Annotated[str, Field(max_length=PASSWORD_MAX_LENGTH), AfterValidator(validate_password_strength)]
Money = Annotated[Decimal, Field(ge=0, max_digits=12, decimal_places=2)]
SignedMoney = Annotated[Decimal, Field(max_digits=12, decimal_places=2)]  # variant price effects may be negative
Percent = Annotated[Decimal, Field(ge=0, le=100, max_digits=5, decimal_places=2)]


class StrictInput(BaseModel):
    """Base for request bodies: trims strings and rejects unknown fields (e.g. a sneaked-in "role")."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class PatchInput(StrictInput):
    """Base for partial updates. Only fields that were sent are applied; required fields cannot be nulled."""

    nullable_fields: ClassVar[frozenset[str]] = frozenset()

    @model_validator(mode="after")
    def _reject_null_for_required_fields(self):
        for name in self.model_fields_set:
            if getattr(self, name) is None and name not in self.nullable_fields:
                raise ValueError(f"{name} cannot be null")
        return self


class Output(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# --- auth / users ---------------------------------------------------------------------------

class EmailInput(StrictInput):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def _normalise_email(cls, v: str) -> str:
        return v.lower()


class SignupIn(EmailInput):
    password: StrongPassword


class StaffCreateIn(EmailInput):
    password: StrongPassword  # initial password set by the admin


class LoginIn(EmailInput):
    password: str = Field(min_length=1, max_length=PASSWORD_MAX_LENGTH)  # strength rules apply on set, not on login


class ForgotPasswordIn(EmailInput):
    pass


class ResetPasswordIn(StrictInput):
    token: str = Field(min_length=1, max_length=256)
    new_password: StrongPassword


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MessageOut(BaseModel):
    message: str


class UserOut(Output):
    id: int
    email: str
    role: Role
    created_at: datetime


# --- products -------------------------------------------------------------------------------

class ProductCreate(StrictInput):
    name: str = Field(min_length=1, max_length=255)
    type: str = Field(min_length=1, max_length=100)
    sales_price: Money
    cost_price: Money
    notes: str | None = None


class ProductUpdate(PatchInput):
    nullable_fields: ClassVar[frozenset[str]] = frozenset({"notes"})

    name: str | None = Field(default=None, min_length=1, max_length=255)
    type: str | None = Field(default=None, min_length=1, max_length=100)
    sales_price: Money | None = None
    cost_price: Money | None = None
    notes: str | None = None


class ProductOut(Output):
    id: int
    name: str
    type: str
    sales_price: Decimal
    cost_price: Decimal
    notes: str | None
    created_at: datetime
    updated_at: datetime


# --- variants -------------------------------------------------------------------------------

class VariantCreate(StrictInput):
    attribute: str = Field(min_length=1, max_length=100, examples=["Brand"])
    value: str = Field(min_length=1, max_length=100, examples=["Odoo"])
    price_effect: SignedMoney = Decimal("0")


class VariantUpdate(PatchInput):
    # product_id is deliberately absent: a variant cannot be moved to another product.
    attribute: str | None = Field(default=None, min_length=1, max_length=100)
    value: str | None = Field(default=None, min_length=1, max_length=100)
    price_effect: SignedMoney | None = None


class VariantOut(Output):
    id: int
    product_id: int
    attribute: str
    value: str
    price_effect: Decimal
    created_at: datetime
    updated_at: datetime


# --- taxes ----------------------------------------------------------------------------------

class TaxCreate(StrictInput):
    name: str = Field(min_length=1, max_length=100)
    rate_percent: Percent


class TaxUpdate(PatchInput):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    rate_percent: Percent | None = None


class TaxOut(Output):
    id: int
    name: str
    rate_percent: Decimal


# --- plans ----------------------------------------------------------------------------------

class PlanCreate(StrictInput):
    name: str = Field(min_length=1, max_length=255)
    product_id: int
    variant_id: int | None = None
    price: Money
    billing_period: BillingPeriod
    min_quantity: int = Field(default=1, ge=1)
    available_from: date | None = None
    available_to: date | None = None
    auto_close: bool = False
    allow_early_close: bool = False
    allow_pause: bool = False
    allow_renew: bool = True
    tax_ids: list[int] = Field(default_factory=list)


class PlanUpdate(PatchInput):
    nullable_fields: ClassVar[frozenset[str]] = frozenset({"variant_id", "available_from", "available_to"})

    name: str | None = Field(default=None, min_length=1, max_length=255)
    product_id: int | None = None
    variant_id: int | None = None
    price: Money | None = None
    billing_period: BillingPeriod | None = None
    min_quantity: int | None = Field(default=None, ge=1)
    available_from: date | None = None
    available_to: date | None = None
    auto_close: bool | None = None
    allow_early_close: bool | None = None
    allow_pause: bool | None = None
    allow_renew: bool | None = None
    tax_ids: list[int] | None = None  # replaces the plan's taxes; send [] to remove them all


class PlanOut(Output):
    id: int
    name: str
    product_id: int
    variant_id: int | None
    price: Decimal
    billing_period: BillingPeriod
    min_quantity: int
    available_from: date | None
    available_to: date | None
    auto_close: bool
    allow_early_close: bool
    allow_pause: bool
    allow_renew: bool
    taxes: list[TaxOut]
    created_at: datetime
    updated_at: datetime


# --- customer profile ------------------------------------------------------------------------

class CustomerProfileCreate(StrictInput):
    name: str = Field(min_length=1, max_length=255)
    address_line1: str = Field(min_length=1, max_length=255)
    address_line2: str | None = Field(default=None, max_length=255)
    city: str = Field(min_length=1, max_length=100)
    state: str = Field(min_length=1, max_length=100)
    postal_code: str = Field(min_length=1, max_length=30)
    country: str = Field(min_length=1, max_length=100)


class CustomerProfileUpdate(PatchInput):
    nullable_fields: ClassVar[frozenset[str]] = frozenset({"address_line2"})
    name: str | None = Field(default=None, min_length=1, max_length=255)
    address_line1: str | None = Field(default=None, min_length=1, max_length=255)
    address_line2: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, min_length=1, max_length=100)
    state: str | None = Field(default=None, min_length=1, max_length=100)
    postal_code: str | None = Field(default=None, min_length=1, max_length=30)
    country: str | None = Field(default=None, min_length=1, max_length=100)


class CustomerProfileOut(Output):
    id: int
    user_id: int
    name: str
    address_line1: str
    address_line2: str | None
    city: str
    state: str
    postal_code: str
    country: str
    created_at: datetime
    updated_at: datetime


# --- payment terms ---------------------------------------------------------------------------

class PaymentTermsCreate(StrictInput):
    label: str = Field(min_length=1, max_length=100)
    days_until_due: int = Field(ge=0)


class PaymentTermsUpdate(PatchInput):
    label: str | None = Field(default=None, min_length=1, max_length=100)
    days_until_due: int | None = Field(default=None, ge=0)


class PaymentTermsOut(Output):
    id: int
    label: str
    days_until_due: int
    created_at: datetime
    updated_at: datetime
