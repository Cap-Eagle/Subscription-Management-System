import os

os.environ.setdefault("SECRET_KEY", "test-secret-key-for-unit-tests-only-0123456789")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from app import models
from app import billing_models  # noqa: F401  # noqa: F401
from app.database import Base, get_db, make_engine
from app.mailer import get_mailer
from app.main import app
from app.models import Role
from app.services.auth_service import register_user

PASSWORD = "Str0ng!Passw0rd"


class InMemoryMailer:
    """Test double for the SMTP mailer. Records what would have been emailed."""

    def __init__(self):
        self.sent: list[tuple[str, str]] = []

    def send_password_reset(self, to_email: str, reset_url: str) -> None:
        self.sent.append((to_email, reset_url))

    @property
    def last_token(self) -> str:
        return self.sent[-1][1].split("token=", 1)[1]


@pytest.fixture
def engine():
    engine = make_engine("sqlite://")
    Base.metadata.create_all(engine)
    yield engine
    engine.dispose()


@pytest.fixture
def db(engine):
    with sessionmaker(bind=engine, expire_on_commit=False)() as session:
        yield session


@pytest.fixture
def mailer():
    return InMemoryMailer()


@pytest.fixture
def client(engine, mailer):
    factory = sessionmaker(bind=engine, expire_on_commit=False)

    def override_get_db():
        with factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_mailer] = lambda: mailer
    yield TestClient(app)
    app.dependency_overrides.clear()


def _headers_for(client: TestClient, db, email: str, role: Role) -> dict[str, str]:
    register_user(db, email, PASSWORD, role)
    response = client.post("/api/auth/login", json={"email": email, "password": PASSWORD})
    assert response.status_code == 200, response.text
    return {"Authorization": f"Bearer {response.json()['access_token']}"}


@pytest.fixture
def admin_headers(client, db):
    return _headers_for(client, db, "admin@example.com", Role.ADMIN)


@pytest.fixture
def staff_headers(client, db):
    return _headers_for(client, db, "staff@example.com", Role.STAFF)


@pytest.fixture
def customer_headers(client, db):
    return _headers_for(client, db, "customer@example.com", Role.CUSTOMER)
