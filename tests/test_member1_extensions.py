from app.models import Customer, PaymentTerms, Role, User
from app.schemas import CustomerProfileCreate, PaymentTermsCreate
from app.services import member1_service as svc
from app.services.billing_adapters import plan_to_billing


PROFILE = {
    "name": "Test Customer", "address_line1": "1 Main Road", "city": "Kochi",
    "state": "Kerala", "postal_code": "682001", "country": "India"
}


def test_customer_profile_api_ownership_and_duplicate(client, customer_headers, db):
    created = client.post("/api/customers/me", json=PROFILE, headers=customer_headers)
    assert created.status_code == 201, created.text
    body = created.json()
    assert body["name"] == "Test Customer"
    assert client.get("/api/customers/me", headers=customer_headers).status_code == 200
    updated = client.patch("/api/customers/me", json={"city": "Thrissur"}, headers=customer_headers)
    assert updated.status_code == 200 and updated.json()["city"] == "Thrissur"
    assert client.post("/api/customers/me", json=PROFILE, headers=customer_headers).status_code == 409


def test_customer_profile_requires_auth_and_role(client, admin_headers):
    assert client.post("/api/customers/me", json=PROFILE).status_code == 401
    assert client.post("/api/customers/me", json=PROFILE, headers=admin_headers).status_code == 403


def test_payment_terms_crud_and_validation(client, admin_headers, staff_headers, customer_headers):
    assert client.post("/api/payment-terms", json={"label": "Net 15", "days_until_due": 15},
                       headers=admin_headers).status_code == 201
    assert client.post("/api/payment-terms", json={"label": "Net 15", "days_until_due": 15},
                       headers=admin_headers).status_code == 409
    assert client.post("/api/payment-terms", json={"label": "Bad", "days_until_due": -1},
                       headers=admin_headers).status_code == 422
    assert client.get("/api/payment-terms", headers=staff_headers).status_code == 200
    assert client.post("/api/payment-terms", json={"label": "Net 0", "days_until_due": 0},
                       headers=customer_headers).status_code == 403


def test_lookup_functions_and_billing_adapters(client, admin_headers, db):
    product = client.post("/api/products", headers=admin_headers,
                          json={"name":"P","type":"subscription","sales_price":"10.00","cost_price":"3.00"}).json()
    plan = client.post("/api/plans", headers=admin_headers, json={
        "name":"Monthly","product_id":product["id"],"price":"10.00","billing_period":"monthly"
    }).json()
    terms = svc.create_payment_terms(db, PaymentTermsCreate(label="Net 30", days_until_due=30))
    assert svc.get_product(db, product["id"]).id == product["id"]
    orm_plan = svc.get_plan(db, plan["id"])
    contract = plan_to_billing(orm_plan)
    assert contract.id == str(plan["id"]) and contract.renewable is True
    assert svc.get_payment_terms_lookup(db, terms.id).days_until_due == 30


def test_status_history_helper_records_actor_and_reason(db):
    from app.services.auth_service import register_user
    from app.models import Role
    from tests.conftest import PASSWORD
    admin_user = register_user(db, "history-admin@example.com", PASSWORD, Role.ADMIN)
    from app.services.status_history import record_status_change
    row = record_status_change(db, entity_type="subscription", entity_id=42,
                               old_status="active", new_status="paused",
                               changed_by_user_id=admin_user.id, reason="Customer request")
    assert row.id is not None
    assert row.entity_id == "42" and row.old_status == "active"
    assert row.new_status == "paused" and row.reason == "Customer request"
