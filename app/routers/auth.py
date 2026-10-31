from fastapi import APIRouter, BackgroundTasks, Depends, status
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.database import get_db
from app.mailer import Mailer, get_mailer
from app.models import Role
from app.schemas import ForgotPasswordIn, LoginIn, MessageOut, ResetPasswordIn, SignupIn, TokenOut, UserOut
from app.security import create_access_token
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def signup(body: SignupIn, db: Session = Depends(get_db)):
    """Public sign-up. Always creates a customer; the role cannot be chosen by the caller."""
    return auth_service.register_user(db, body.email, body.password, Role.CUSTOMER)


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db), settings: Settings = Depends(get_settings)):
    user = auth_service.authenticate(db, body.email, body.password)
    return TokenOut(access_token=create_access_token(user.id, settings))


@router.post("/forgot-password", response_model=MessageOut, status_code=status.HTTP_202_ACCEPTED)
def forgot_password(
    body: ForgotPasswordIn,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
    mailer: Mailer = Depends(get_mailer),
):
    """Always answers the same way, so it cannot be used to discover which emails are registered."""
    raw_token = auth_service.start_password_reset(db, body.email, settings)
    if raw_token is not None:
        # The raw token goes only into the email, sent after the response. It is never returned or logged.
        background_tasks.add_task(
            mailer.send_password_reset, body.email, auth_service.build_reset_url(settings, raw_token)
        )
    return MessageOut(message="If that email is registered, a reset link has been sent.")


@router.post("/reset-password", response_model=MessageOut)
def reset_password(body: ResetPasswordIn, db: Session = Depends(get_db)):
    auth_service.complete_password_reset(db, body.token, body.new_password)
    return MessageOut(message="Password updated. You can now sign in.")
