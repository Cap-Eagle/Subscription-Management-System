import logging
from datetime import timedelta

from app.models import PasswordResetToken
from app.utils import utcnow
from tests.conftest import PASSWORD

NEW_PASSWORD = "An0ther!Passw0rd"


def _request_reset(client, email="user@example.com"):
    return client.post("/api/auth/forgot-password", json={"email": email})


def _login(client, password, email="user@example.com"):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def _signup(client):
    assert client.post("/api/auth/signup", json={"email": "user@example.com", "password": PASSWORD}).status_code == 201


def test_reset_flow_end_to_end(client, mailer):
    _signup(client)
    assert _request_reset(client).status_code == 202
    assert len(mailer.sent) == 1
    to_email, url = mailer.sent[0]
    assert to_email == "user@example.com" and "/reset-password?token=" in url

    done = client.post("/api/auth/reset-password", json={"token": mailer.last_token, "new_password": NEW_PASSWORD})
    assert done.status_code == 200
    assert _login(client, NEW_PASSWORD).status_code == 200
    assert _login(client, PASSWORD).status_code == 401  # old password no longer works


def test_reused_reset_token_is_rejected(client, mailer):
    _signup(client)
    _request_reset(client)
    token = mailer.last_token

    first = client.post("/api/auth/reset-password", json={"token": token, "new_password": NEW_PASSWORD})
    assert first.status_code == 200

    second = client.post("/api/auth/reset-password", json={"token": token, "new_password": "Third!Passw0rd1"})
    assert second.status_code == 400
    assert _login(client, NEW_PASSWORD).status_code == 200  # the second attempt changed nothing
    assert _login(client, "Third!Passw0rd1").status_code == 401


def test_expired_reset_token_is_rejected(client, db, mailer):
    _signup(client)
    _request_reset(client)

    row = db.query(PasswordResetToken).one()
    row.expires_at = utcnow() - timedelta(seconds=1)  # push the expiry into the past
    db.commit()

    response = client.post("/api/auth/reset-password", json={"token": mailer.last_token, "new_password": NEW_PASSWORD})
    assert response.status_code == 400
    assert _login(client, PASSWORD).status_code == 200  # password unchanged


def test_unknown_token_is_rejected(client):
    response = client.post("/api/auth/reset-password", json={"token": "not-a-real-token", "new_password": NEW_PASSWORD})
    assert response.status_code == 400


def test_weak_new_password_is_rejected_and_does_not_burn_the_token(client, mailer):
    _signup(client)
    _request_reset(client)
    token = mailer.last_token

    weak = client.post("/api/auth/reset-password", json={"token": token, "new_password": "weak"})
    assert weak.status_code == 422
    ok = client.post("/api/auth/reset-password", json={"token": token, "new_password": NEW_PASSWORD})
    assert ok.status_code == 200


def test_requesting_a_new_link_voids_the_previous_one(client, mailer):
    _signup(client)
    _request_reset(client)
    old_token = mailer.last_token
    _request_reset(client)
    new_token = mailer.last_token
    assert old_token != new_token

    stale = client.post("/api/auth/reset-password", json={"token": old_token, "new_password": NEW_PASSWORD})
    assert stale.status_code == 400
    fresh = client.post("/api/auth/reset-password", json={"token": new_token, "new_password": NEW_PASSWORD})
    assert fresh.status_code == 200


def test_unknown_email_gets_the_same_response_and_no_email(client, mailer):
    _signup(client)
    known = _request_reset(client, "user@example.com")
    unknown = _request_reset(client, "nobody@example.com")
    assert known.status_code == unknown.status_code == 202
    assert known.json() == unknown.json()
    assert len(mailer.sent) == 1  # only the real account was emailed


def test_raw_token_never_appears_in_the_response_logs_or_database(client, db, mailer, caplog):
    _signup(client)
    with caplog.at_level(logging.DEBUG):
        response = _request_reset(client)
        token = mailer.last_token
        client.post("/api/auth/reset-password", json={"token": token, "new_password": NEW_PASSWORD})

    assert token not in response.text
    assert token not in caplog.text
    stored = db.query(PasswordResetToken).one()
    assert token not in {stored.token_hash, str(stored.user_id)}
    assert len(stored.token_hash) == 64 and stored.token_hash != token  # only a SHA-256 hash is kept
