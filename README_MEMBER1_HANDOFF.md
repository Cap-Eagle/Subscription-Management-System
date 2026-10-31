# Member 1 Backend — Handoff Document

## 1. Project Overview

This package contains the current implementation of Member 1's backend foundation for the Brightloop Software Subscription Management System.

The backend is built using:

- Python
- FastAPI
- SQLAlchemy
- SQLite for local development
- Alembic for database migrations
- Pydantic for request and response validation
- JWT authentication
- Argon2 password hashing
- Pytest for automated testing

The backend is designed to provide shared infrastructure for the subscription and billing modules developed by the other team members.

## 2. Current Implementation

The following functionality is already implemented.

### Authentication and User Management

- Customer signup
- User login
- JWT-based authentication
- Password hashing using Argon2
- Password reset workflow
- Password strength validation
- Unique email validation
- Admin, Staff, and Customer roles

### Role-Based Access Control

The current roles are:

- Admin
- Staff
- Customer

Permissions are centralized in `app/permissions.py`.

Current permissions include:

- Staff creation
- Catalogue read access
- Catalogue write access

Protected API routes use shared authorization dependencies.

### Product Catalogue

Implemented models and APIs for:

- Products
- Product variants
- Variant price adjustments
- Product and variant validation
- Product deletion restrictions when referenced by plans

### Subscription Plans

Plan functionality currently supports:

- Plan creation and updates
- Product association
- Optional product variant association
- Price
- Billing period: daily, weekly, monthly, yearly
- Minimum quantity
- Availability dates
- Automatic closure flag
- Early closure permission
- Pause permission
- Renewal permission
- Tax association

### Tax Management

- Tax creation and updates
- Tax percentage validation
- Tax association with plans
- Protection against deleting taxes that are still in use

### Shared Infrastructure

- Central SQLAlchemy declarative `Base`
- Shared database engine and session factory
- SQLite foreign-key enforcement
- Environment-based configuration
- Alembic migration setup
- Shared Pydantic schemas
- Common API error handling

## 3. Existing Project Structure

Important files and directories:

```text
app/
├── config.py
├── database.py
├── dependencies.py
├── errors.py
├── mailer.py
├── main.py
├── models.py
├── permissions.py
├── schemas.py
├── security.py
├── utils.py
├── routers/
│   ├── auth.py
│   ├── plans.py
│   ├── products.py
│   ├── staff.py
│   ├── taxes.py
│   └── variants.py
└── services/
    ├── auth_service.py
    └── catalog_service.py

migrations/
├── env.py
├── script.py.mako
└── versions/
    └── 0001_auth_and_catalog.py

scripts/
tests/
docs/
source/

alembic.ini
pytest.ini
requirements.txt
requirements-dev.txt
.env.example
AGENTS.md
README.md
```

## 4. Test Status

The current implementation was tested using:

```bash
python -m pytest -v
```

Latest reported result:

**61 tests passed, 1 warning.**

The warning concerns Starlette's use of `httpx` in its test client. It did not cause any test failures.

Please rerun the tests after making changes.

## 5. Additions Requested

The following work is expected to extend the existing Member 1 backend.

### A. Customer Profile Management

Currently, signup creates a `User` record, but there is no separate customer profile.

Implement a `Customer` model linked one-to-one with `User`.

Suggested fields:

| Field | Description |
|---|---|
| id | Primary key |
| user_id | Unique foreign key referencing users.id |
| name | Customer's full name |
| address_line1 | Billing address |
| address_line2 | Optional additional address |
| city | City |
| state | State |
| postal_code | Postal or ZIP code |
| country | Country |
| created_at | Creation timestamp |
| updated_at | Last update timestamp |

Requirements:

- A customer profile should be associated with a customer-role user.
- Customer profile creation and user signup should be transactionally consistent.
- A user must not be able to create a profile for another user.
- Customers should be able to view and update their own profile.
- Admin access should be supported where appropriate.
- Validate all input using Pydantic schemas.
- Add tests for profile creation, retrieval, updates, authorization, and duplicate profiles.

**Signup behaviour to confirm with the team:** whether signup should collect the customer's name and create the profile immediately, or whether profile completion should happen through a separate endpoint.

### B. Payment Terms Management

Implement a reusable `PaymentTerms` model.

Suggested fields:

| Field | Description |
|---|---|
| id | Primary key |
| label | Example: Net 15 |
| days_until_due | Number of days before invoice payment is due |
| created_at | Creation timestamp |
| updated_at | Last update timestamp |

Requirements:

- Support terms such as Net 0, Net 15, and Net 30.
- Validate that `days_until_due` is non-negative.
- Payment-term labels should be unique.
- Admins should be able to create, update, list, and delete terms.
- Prevent deletion when a payment term is referenced by a subscription or invoice.
- Staff should have read-only access if the team agrees with the existing catalogue permission model.
- Customers should not manage payment terms.

### C. Shared Lookup Services

The billing engine must be able to retrieve Member 1's data without directly depending on API routes.

Add reusable SQLAlchemy-based lookup functions for:

- `get_customer(customer_id)`
- `get_plan(plan_id)`
- `get_product(product_id)`
- `get_tax_rules_for(line)`
- `get_payment_terms(terms_id)`

These functions should accept or use a shared SQLAlchemy session.

Do not introduce a second database engine, declarative Base, or independent persistence layer.

### D. Billing Contract Compatibility

The billing engine currently uses dataclass contracts with string IDs, while the database models use integer IDs.

Create an adapter layer that maps database models to the existing billing contracts.

Pay attention to these field mappings:

| Billing contract | Database model |
|---|---|
| auto_close_at_end | Plan.auto_close |
| closable_early | Plan.allow_early_close |
| pausable | Plan.allow_pause |
| renewable | Plan.allow_renew |
| rate_percent | Tax.rate_percent |

Keep the billing engine's pure calculation logic independent of SQLAlchemy.

### E. Database Migration

Create a new Alembic migration for the additions.

Important:

- Do not modify the existing `0001_auth_and_catalog.py` migration.
- Do not delete or recreate existing tables.
- Preserve the existing database naming conventions.
- Ensure foreign keys and uniqueness constraints are correct.
- Test both migration upgrade and downgrade where practical.

### F. Automated Tests

Add tests for:

- Customer profile creation and retrieval
- Customer profile updates
- Customer ownership and permissions
- Payment-term creation and validation
- Payment-term uniqueness
- Payment-term deletion restrictions
- Lookup services
- Billing contract adapters
- Migration compatibility

All existing tests must continue to pass.

## 6. Architecture and Development Rules

Please follow these rules while extending the project:

1. Reuse `app.database.Base`.
2. Reuse `get_db()` and the existing SQLAlchemy session infrastructure.
3. Keep shared models in the existing model layer or split them into modules while preserving a single declarative Base.
4. Keep request validation in Pydantic schemas.
5. Keep business logic in service modules rather than putting it directly in route handlers.
6. Reuse the existing authentication and permission dependencies.
7. Use `Decimal` or integer minor units for money. Never use floating-point arithmetic for billing.
8. Do not duplicate existing product, plan, tax, user, or database models.
9. Do not implement subscription and invoice lifecycle logic as part of this assignment; those belong to Member 2.
10. Add tests for every new feature.

## 7. Files That Should Not Be Replaced

Please preserve these existing components:

- `app/database.py`
- `app/models.py`
- `app/dependencies.py`
- `app/permissions.py`
- `app/security.py`
- `migrations/versions/0001_auth_and_catalog.py`

You may extend or refactor them carefully, but do not replace the existing implementation with an unrelated backend.

## 8. Definition of Done

The assignment is complete when:

- Customer profile functionality is implemented.
- Payment terms functionality is implemented.
- Shared lookup services are available.
- Billing contract adapters are available.
- A new Alembic migration is created.
- All new tests pass.
- All original 61 tests still pass.
- API documentation is accessible through FastAPI Swagger UI.
- The updated implementation and migration instructions are documented.

## 9. How to Run the Project

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
python -m pip install -r requirements-dev.txt
```

Create a local `.env` using `.env.example` as a reference. Set a sufficiently long random `SECRET_KEY`.

Run migrations:

```bash
alembic upgrade head
```

Start the API:

```bash
uvicorn app.main:app --reload
```

Open the API documentation:

```text
http://127.0.0.1:8000/docs
```

Run tests:

```bash
python -m pytest -v
```

---

**Handoff note:** This package represents the current Member 1 implementation. Customer profiles, payment terms, and the requested lookup adapters are pending additions, not completed features. Please coordinate any changes to shared models or API contracts with the billing-engine owner before merging.
