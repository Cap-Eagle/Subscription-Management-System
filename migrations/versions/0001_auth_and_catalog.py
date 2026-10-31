"""Platform and Auth: users, password reset tokens, products, variants, taxes, plans

Revision ID: 0001
Revises:
Create Date: 2026-10-31
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def _enum(*values: str, name: str) -> sa.Enum:
    return sa.Enum(*values, name=name, native_enum=False, create_constraint=True, length=20)


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("role", _enum("admin", "staff", "customer", name="user_role"), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    op.create_table(
        "password_reset_tokens",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("used_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token_hash"),
    )
    op.create_index("ix_password_reset_tokens_user_id", "password_reset_tokens", ["user_id"])

    op.create_table(
        "products",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("type", sa.String(length=100), nullable=False),
        sa.Column("sales_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("cost_price", sa.Numeric(12, 2), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.CheckConstraint("sales_price >= 0", name="sales_price_non_negative"),
        sa.CheckConstraint("cost_price >= 0", name="cost_price_non_negative"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "product_variants",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("attribute", sa.String(length=100), nullable=False),
        sa.Column("value", sa.String(length=100), nullable=False),
        sa.Column("price_effect", sa.Numeric(12, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "product_id", "attribute", "value", name="uq_product_variants_product_attribute_value"
        ),
        sa.UniqueConstraint("id", "product_id", name="uq_product_variants_id_product_id"),
    )
    op.create_index("ix_product_variants_product_id", "product_variants", ["product_id"])

    op.create_table(
        "taxes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("rate_percent", sa.Numeric(5, 2), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.CheckConstraint("rate_percent >= 0 AND rate_percent <= 100", name="rate_percent_range"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "plans",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("variant_id", sa.Integer(), nullable=True),
        sa.Column("price", sa.Numeric(12, 2), nullable=False),
        sa.Column(
            "billing_period",
            _enum("daily", "weekly", "monthly", "yearly", name="billing_period"),
            nullable=False,
        ),
        sa.Column("min_quantity", sa.Integer(), nullable=False),
        sa.Column("available_from", sa.Date(), nullable=True),
        sa.Column("available_to", sa.Date(), nullable=True),
        sa.Column("auto_close", sa.Boolean(), nullable=False),
        sa.Column("allow_early_close", sa.Boolean(), nullable=False),
        sa.Column("allow_pause", sa.Boolean(), nullable=False),
        sa.Column("allow_renew", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.CheckConstraint("price >= 0", name="price_non_negative"),
        sa.CheckConstraint("min_quantity >= 1", name="min_quantity_positive"),
        sa.CheckConstraint(
            "available_from IS NULL OR available_to IS NULL OR available_from <= available_to",
            name="availability_order",
        ),
        sa.ForeignKeyConstraint(["product_id"], ["products.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(
            ["variant_id", "product_id"],
            ["product_variants.id", "product_variants.product_id"],
            name="fk_plans_variant_product",
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_plans_product_id", "plans", ["product_id"])

    op.create_table(
        "plan_taxes",
        sa.Column("plan_id", sa.Integer(), nullable=False),
        sa.Column("tax_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["plan_id"], ["plans.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tax_id"], ["taxes.id"], ondelete="RESTRICT"),
        sa.PrimaryKeyConstraint("plan_id", "tax_id"),
    )
    op.create_index("ix_plan_taxes_tax_id", "plan_taxes", ["tax_id"])


def downgrade() -> None:
    op.drop_table("plan_taxes")
    op.drop_table("plans")
    op.drop_table("taxes")
    op.drop_table("product_variants")
    op.drop_table("products")
    op.drop_table("password_reset_tokens")
    op.drop_table("users")
