# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler
# Odoo Subscription Management System

An integrated subscription management platform for managing customers, products, variants, subscription plans, taxes, payment terms, subscriptions and billing operations.

## Technology Stack

| Component | Technology |
|---|---|
| Backend | FastAPI |
| Language | Python |
| ORM | SQLAlchemy 2.0 |
| Migrations | Alembic |
| Validation | Pydantic |
| Authentication | JWT |
| Password hashing | Argon2 |
| Testing | pytest |

## Features

- User registration, login and password reset.
- JWT authentication and role-based permissions.
- Customer profile management.
- Product and variant management.
- Subscription plan, tax and payment-term management.
- Subscription and subscription-line models.
- Quotation templates and quotation lines.
- Invoice and invoice-line models.
- Discount rules and invoice discount applications.
- Shared billing adapters and status-history services.

**Note:** Billing models and integration services are implemented. Dedicated public billing API endpoints are not currently registered.

## Project Structure

```text
app/
├── routers/
├── services/
├── models.py
├── billing_models.py
├── schemas.py
├── database.py
├── security.py
├── permissions.py
└── main.py
migrations/
tests/
scripts/
requirements.txt
requirements-dev.txt
README.md
```

## Installation and Setup

### Linux / macOS

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -r requirements-dev.txt
cp .env.example .env
```

Configure the required environment variables in `.env`. Never commit secrets or credentials.

### Windows PowerShell

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pip install -r requirements-dev.txt
Copy-Item .env.example .env
```

### Database Migrations

```bash
alembic upgrade head
alembic current
```

### Start the Application

```bash
uvicorn app.main:app --reload
```

API documentation:
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## Endpoints (all under /api)
| Area | Endpoints | Who |
|---|---|---|
| Auth | `POST /auth/signup` (creates a customer), `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` | public |
| Staff | `POST /staff` | admin |
| Products | `GET/POST /products`, `GET/PATCH/DELETE /products/{id}` | read: admin, staff. write: admin |
| Variants | `GET/POST /products/{id}/variants`, `GET/PATCH/DELETE /variants/{id}` | read: admin, staff. write: admin |
| Plans | `GET/POST /plans`, `GET/PATCH/DELETE /plans/{id}` (taxes via `tax_ids`) | read: admin, staff. write: admin |
| Taxes | `GET/POST /taxes`, `GET/PATCH/DELETE /taxes/{id}` (rate via `rate_percent`) | read: admin, staff. write: admin |

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
## Customer and Billing Extensions

### Customer profiles
Signup continues to create the portal `User` only, because the existing signup contract collects only email and password. A customer then creates/completes their own one-to-one profile:
- `POST /api/customers/me`
- `GET /api/customers/me`
- `PATCH /api/customers/me`
- `GET /api/customers/{customer_id}` (admin only)

Profile ownership is derived from the authenticated JWT user; request bodies cannot choose `user_id`. If the team decides profile fields must be collected at signup, update the signup schema and create the user and profile in one transaction.

### Payment terms
Admin can manage terms; staff can read them; customers have no access:
- `GET /api/payment-terms`
- `GET /api/payment-terms/{terms_id}`
- `POST /api/payment-terms`
- `PATCH /api/payment-terms/{terms_id}`
- `DELETE /api/payment-terms/{terms_id}`

Example: `{"label":"Net 15","days_until_due":15}`. `days_until_due` must be zero or greater and labels are unique. Deletion checks for references from `subscriptions` and `invoices` tables if those tables are present in the shared database.

### Billing integration services
Use `app.services.member1_service` for SQLAlchemy-backed lookups (`get_customer`, `get_plan`, `get_product`, `get_tax_rules_for`, `get_payment_terms`). `get_payment_terms_lookup` remains as a compatibility alias. Functions accept the shared SQLAlchemy `Session`; they do not create a new engine. `app.services.billing_adapters` maps ORM objects to plain dataclasses with string IDs and `Decimal` money/rates. In particular, `auto_close` maps to `auto_close_at_end`, `allow_early_close` to `closable_early`, `allow_pause` to `pausable`, `allow_renew` to `renewable`, and tax `rate_percent` stays `rate_percent`.

### Shared status history
`app.services.status_history.record_status_change(...)` provides a shared audit helper for other modules. It records entity type/ID, previous and new status, timestamp, actor user ID, and reason. Pass `commit=False` to participate in a larger transaction.

## Migration Reference

Alembic manages database schema changes. Available migrations are located in `migrations/versions/`.

Apply migrations:

```bash
alembic upgrade head
```

Check the current revision:

```bash
alembic current
```

Review migration history:

```bash
alembic history
```

## Running Tests

Run the automated test suite from the project root:

```bash
pytest -v
```

## Development Guidelines

- Keep API routes inside `app/routers/`.
- Keep business logic inside `app/services/`.
- Define request and response validation using Pydantic schemas.
- Use SQLAlchemy models for database entities.
- Use Alembic migrations for schema changes.
- Add or update tests when changing application behavior.
- Keep secrets and local database files out of Git.
- Coordinate shared changes with the other team members.


## Repository

The project uses Git for version control. Create focused commits with descriptive messages and push changes to the shared `main` branch only after reviewing them.

## Team Members

This project is collaboratively developed by:

| No. | Team Member |
|---:|---|
| 1 | Adithya Prajeesh |
| 2 | Adith K |
| 3 | Adinarayanan |
| 4 | Devapriyan G S |

