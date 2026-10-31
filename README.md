# Subscription Management: Platform and Auth

Users, roles, products, variants, plans and taxes, with sign-up/login, password rules, a reset-link
flow, server-side role permissions and admin-only staff creation.

Stack: FastAPI, SQLAlchemy 2.0, Alembic, pytest (see "Assumptions" in the hand-off notes).

## Run it
```bash
python -m venv .venv && . .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env            # then set SECRET_KEY
alembic upgrade head            # creates the tables
ADMIN_PASSWORD='Str0ng!pass' python -m scripts.create_admin you@example.com   # first admin
uvicorn app.main:app --reload   # docs at http://127.0.0.1:8000/docs
pytest
```

## Endpoints (all under /api)
| Area | Endpoints | Who |
|---|---|---|
| Auth | `POST /auth/signup` (creates a customer), `/auth/login`, `/auth/forgot-password`, `/auth/reset-password` | public |
| Staff | `POST /staff` | admin |
| Products | `GET/POST /products`, `GET/PATCH/DELETE /products/{id}` | read: admin, staff. write: admin |
| Variants | `GET/POST /products/{id}/variants`, `GET/PATCH/DELETE /variants/{id}` | read: admin, staff. write: admin |
| Plans | `GET/POST /plans`, `GET/PATCH/DELETE /plans/{id}` (taxes via `tax_ids`) | read: admin, staff. write: admin |
| Taxes | `GET/POST /taxes`, `GET/PATCH/DELETE /taxes/{id}` (rate via `rate_percent`) | read: admin, staff. write: admin |

Permissions live in one table: `app/permissions.py`.


## Member 1 handoff extensions

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

### Windows PowerShell setup
Run from the `subscription_platform` project directory:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install --upgrade pip
py -m pip install -r requirements-dev.txt
Copy-Item .env.example .env
```

Edit `.env` and set a long random `SECRET_KEY`. Then run:

```powershell
py -m alembic upgrade head
$env:ADMIN_PASSWORD = "Str0ng!pass"
py -m scripts.create_admin admin@example.com
py -m uvicorn app.main:app --reload
```

Open `http://127.0.0.1:8000/docs`. In a second terminal (with the virtual environment active), run `py -m pytest -v`.

The new additive migration is `0002_member1_extensions.py`; the original `0001_auth_and_catalog.py` migration is unchanged. The handoff additions have tests for profile ownership and duplicate prevention, payment-term validation and deletion restrictions, lookups, and billing adapters. In this environment, the complete suite passes with 69 tests; rerun `py -m pytest -v` on the target Windows machine before submission.

## Team Members

This project is collaboratively developed by:

| No. | Team Member |
|---:|---|
| 1 | Adithya Prajeesh |
| 2 | Adith K |
| 3 | Adinarayanan |
| 4 | Devapriyan G S |

