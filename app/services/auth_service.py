"""Account creation, login, and the password-reset flow."""
from datetime import timedelta

from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import Settings
from app.errors import BadRequest, Conflict, Unauthorized
from app.models import PasswordResetToken, Role, User
from app.security import generate_reset_token, hash_password, hash_reset_token, verify_password
from app.utils import utcnow


def register_user(db: Session, email: str, password: str, role: Role) -> User:
    """Create an account. `email` must already be lower-cased and `password` already validated."""
    user = User(email=email, password_hash=hash_password(password), role=role)
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise Conflict("An account with this email already exists") from None
    return user


def authenticate(db: Session, email: str, password: str) -> User:
    user = db.scalar(select(User).where(User.email == email))
    password_ok = verify_password(user.password_hash if user else None, password)
    if user is None or not password_ok:
        raise Unauthorized("Incorrect email or password")  # same message whether the email exists or not
    return user


def start_password_reset(db: Session, email: str, settings: Settings) -> str | None:
    """Issue a reset token for the account, if one exists.

    Returns the raw token (to be emailed, nothing else) or None for an unknown email. Any earlier
    unused tokens for the user are voided, so only the newest link works.
    """
    user = db.scalar(select(User).where(User.email == email))
    if user is None:
        return None

    now = utcnow()
    db.execute(
        update(PasswordResetToken)
        .where(PasswordResetToken.user_id == user.id, PasswordResetToken.used_at.is_(None))
        .values(used_at=now)
    )
    raw_token, token_hash = generate_reset_token()
    db.add(
        PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=now + timedelta(minutes=settings.password_reset_ttl_minutes),
        )
    )
    db.commit()
    return raw_token


def build_reset_url(settings: Settings, raw_token: str) -> str:
    return f"{settings.frontend_base_url.rstrip('/')}/reset-password?token={raw_token}"


def complete_password_reset(db: Session, raw_token: str, new_password: str) -> None:
    """Set a new password using a reset token. `new_password` must already be validated.

    The token is consumed with a conditional UPDATE, so two simultaneous requests cannot both succeed.
    """
    invalid = BadRequest("This reset link is invalid or has expired")
    now = utcnow()

    token = db.scalar(select(PasswordResetToken).where(PasswordResetToken.token_hash == hash_reset_token(raw_token)))
    if token is None or token.used_at is not None or token.expires_at <= now:
        raise invalid

    consumed = db.execute(
        update(PasswordResetToken)
        .where(PasswordResetToken.id == token.id, PasswordResetToken.used_at.is_(None))
        .values(used_at=now)
    )
    if consumed.rowcount != 1:
        db.rollback()
        raise invalid

    user = db.get(User, token.user_id)
    user.password_hash = hash_password(new_password)
    # Any other outstanding links for this user are now void too.
    db.execute(
        update(PasswordResetToken)
        .where(PasswordResetToken.user_id == user.id, PasswordResetToken.used_at.is_(None))
        .values(used_at=now)
    )
    db.commit()
