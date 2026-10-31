"""Password rules and hashing, access tokens, and password-reset token helpers."""
import hashlib
import secrets
from datetime import timedelta

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

from app.config import Settings
from app.errors import Unauthorized
from app.utils import utcnow

PASSWORD_MAX_LENGTH = 128  # bounds hashing cost

_hasher = PasswordHasher()
# Verified against when an email is unknown, so login takes similar time either way.
_DUMMY_HASH = _hasher.hash("not-a-real-password")


# --- password rules -----------------------------------------------------------------------

def password_problems(password: str) -> list[str]:
    """Return the rules a password breaks (empty list means it is acceptable).

    Rules: more than 8 characters, an uppercase letter, a lowercase letter, a special character.
    """
    problems = []
    if len(password) <= 8:
        problems.append("be longer than 8 characters")
    if not any(c.isupper() for c in password):
        problems.append("contain an uppercase letter")
    if not any(c.islower() for c in password):
        problems.append("contain a lowercase letter")
    if not any(not c.isalnum() and not c.isspace() for c in password):
        problems.append("contain a special character")
    return problems


def validate_password_strength(password: str) -> str:
    problems = password_problems(password)
    if problems:
        raise ValueError("Password must " + "; ".join(problems))
    return password


# --- password hashing ---------------------------------------------------------------------

def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password_hash: str | None, password: str) -> bool:
    try:
        return _hasher.verify(password_hash or _DUMMY_HASH, password) and password_hash is not None
    except (VerificationError, InvalidHashError):
        return False


# --- access tokens (JWT) ------------------------------------------------------------------

def create_access_token(user_id: int, settings: Settings) -> str:
    now = utcnow()
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_ttl_minutes),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str, settings: Settings) -> int:
    """Return the user id in a valid token, or raise Unauthorized.

    The token only identifies the user. The role is always read from the database, so a
    role change takes effect immediately and a token can never carry its own permissions.
    """
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.jwt_algorithm],
            options={"require": ["exp", "sub"]},
        )
        return int(payload["sub"])
    except (jwt.PyJWTError, ValueError):
        raise Unauthorized("Invalid or expired token") from None


# --- password-reset tokens ----------------------------------------------------------------

def generate_reset_token() -> tuple[str, str]:
    """Return (raw_token, sha256_hex). Only the hash is ever stored."""
    raw = secrets.token_urlsafe(32)
    return raw, hash_reset_token(raw)


def hash_reset_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()
