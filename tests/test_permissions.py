import pytest

from app.main import app
from app.models import Role, User
from tests.conftest import PASSWORD

STAFF_PAYLOAD = {"email": "new.staff@example.com", "password": PASSWORD}

# The only endpoints that may be called without signing in.
PUBLIC = {
    ("post", "/api/auth/signup"),
    ("post", "/api/auth/login"),
    ("post", "/api/auth/forgot-password"),
    ("post", "/api/auth/reset-password"),
}


def test_non_admin_is_refused_staff_creation(client, db, staff_headers, customer_headers):
    assert client.post("/api/staff", json=STAFF_PAYLOAD, headers=customer_headers).status_code == 403
    assert client.post("/api/staff", json=STAFF_PAYLOAD, headers=staff_headers).status_code == 403  # staff cannot add staff
    assert client.post("/api/staff", json=STAFF_PAYLOAD).status_code == 401  # not signed in
    assert db.query(User).filter_by(email=STAFF_PAYLOAD["email"]).count() == 0  # nothing was created


def test_admin_can_create_staff_and_the_account_has_the_staff_role(client, db, admin_headers):
    response = client.post("/api/staff", json=STAFF_PAYLOAD, headers=admin_headers)
    assert response.status_code == 201
    assert response.json()["role"] == Role.STAFF.value
    assert db.query(User).filter_by(email=STAFF_PAYLOAD["email"]).one().role == Role.STAFF

    # The new staff member can sign in, but is not an admin.
    login = client.post("/api/auth/login", json=STAFF_PAYLOAD)
    assert login.status_code == 200
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    assert client.post("/api/staff", json={**STAFF_PAYLOAD, "email": "x@example.com"}, headers=headers).status_code == 403


def test_staff_creation_cannot_set_a_role_or_use_a_weak_password(client, admin_headers):
    assert client.post("/api/staff", json={**STAFF_PAYLOAD, "role": "admin"}, headers=admin_headers).status_code == 422
    assert client.post("/api/staff", json={**STAFF_PAYLOAD, "password": "weak"}, headers=admin_headers).status_code == 422


def _concrete_operations():
    for path, methods in app.openapi()["paths"].items():
        for method in methods:
            yield method, path


def test_every_non_public_endpoint_requires_authentication(client):
    checked = 0
    for method, path in _concrete_operations():
        if (method, path) in PUBLIC:
            continue
        url = path.replace("{product_id}", "1").replace("{variant_id}", "1").replace("{plan_id}", "1").replace("{tax_id}", "1")
        response = client.request(method.upper(), url, json={})
        assert response.status_code == 401, f"{method.upper()} {path} is reachable without signing in"
        checked += 1
    assert checked >= 15  # guards against the loop silently checking nothing


@pytest.mark.parametrize(
    "method,url",
    [
        ("get", "/api/products"),
        ("get", "/api/plans"),
        ("get", "/api/taxes"),
        ("get", "/api/products/1/variants"),
        ("post", "/api/products"),
        ("post", "/api/plans"),
        ("post", "/api/taxes"),
        ("delete", "/api/products/1"),
    ],
)
def test_customers_have_no_catalog_access(client, customer_headers, method, url):
    assert client.request(method.upper(), url, json={}, headers=customer_headers).status_code == 403


@pytest.mark.parametrize(
    "method,url",
    [
        ("post", "/api/products"),
        ("patch", "/api/products/1"),
        ("delete", "/api/products/1"),
        ("post", "/api/products/1/variants"),
        ("patch", "/api/variants/1"),
        ("delete", "/api/variants/1"),
        ("post", "/api/plans"),
        ("patch", "/api/plans/1"),
        ("delete", "/api/plans/1"),
        ("post", "/api/taxes"),
        ("patch", "/api/taxes/1"),
        ("delete", "/api/taxes/1"),
    ],
)
def test_staff_cannot_change_the_catalog(client, staff_headers, method, url):
    assert client.request(method.upper(), url, json={}, headers=staff_headers).status_code == 403


def test_staff_can_read_the_catalog(client, staff_headers):
    for url in ("/api/products", "/api/plans", "/api/taxes"):
        assert client.get(url, headers=staff_headers).status_code == 200
