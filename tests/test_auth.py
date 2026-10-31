import pytest

from app.models import Role, User
from app.security import password_problems
from tests.conftest import PASSWORD


def test_signup_creates_a_customer_and_login_works(client, db):
    response = client.post("/api/auth/signup", json={"email": "New.User@Example.com", "password": PASSWORD})
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "new.user@example.com"  # normalised to lower case
    assert body["role"] == "customer"
    assert "password" not in body and "password_hash" not in body

    login = client.post("/api/auth/login", json={"email": "NEW.user@example.com", "password": PASSWORD})
    assert login.status_code == 200
    assert login.json()["token_type"] == "bearer"


def test_signup_cannot_choose_a_role(client, db):
    response = client.post(
        "/api/auth/signup", json={"email": "sneaky@example.com", "password": PASSWORD, "role": "admin"}
    )
    assert response.status_code == 422
    assert db.query(User).count() == 0


def test_one_account_per_email(client):
    payload = {"email": "dup@example.com", "password": PASSWORD}
    assert client.post("/api/auth/signup", json=payload).status_code == 201
    assert client.post("/api/auth/signup", json={**payload, "email": "DUP@example.com"}).status_code == 409


@pytest.mark.parametrize(
    "password",
    [
        "Ab!defg1",  # 8 characters: must be MORE than 8
        "alllowercase!1",  # no uppercase
        "ALLUPPERCASE!1",  # no lowercase
        "NoSpecialChar1",  # no special character
        "",
    ],
)
def test_signup_rejects_weak_passwords(client, password):
    response = client.post("/api/auth/signup", json={"email": "weak@example.com", "password": password})
    assert response.status_code == 422


def test_password_rule_boundaries():
    assert password_problems("Abcdefg!1") == []  # 9 characters, meets every rule
    assert password_problems("Abcdefg!") == ["be longer than 8 characters"]
    assert len(password_problems("")) == 4


def test_login_failure_is_the_same_for_wrong_password_and_unknown_email(client, db):
    client.post("/api/auth/signup", json={"email": "real@example.com", "password": PASSWORD})
    wrong_password = client.post("/api/auth/login", json={"email": "real@example.com", "password": "Wrong!Passw0rd"})
    unknown_email = client.post("/api/auth/login", json={"email": "nobody@example.com", "password": PASSWORD})
    assert wrong_password.status_code == unknown_email.status_code == 401
    assert wrong_password.json() == unknown_email.json()


def test_tampered_or_missing_token_is_rejected(client, admin_headers):
    assert client.get("/api/products").status_code == 401
    bad = {"Authorization": admin_headers["Authorization"][:-3] + "abc"}
    assert client.get("/api/products", headers=bad).status_code == 401


def test_role_in_token_cannot_be_forged_the_role_comes_from_the_database(client, db, customer_headers):
    # Promote in the DB: the same token now carries the new role, proving the role is not read from the token.
    user = db.query(User).filter_by(email="customer@example.com").one()
    assert client.get("/api/products", headers=customer_headers).status_code == 403
    user.role = Role.STAFF
    db.commit()
    assert client.get("/api/products", headers=customer_headers).status_code == 200
