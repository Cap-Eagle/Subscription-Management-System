"""Application settings, read from environment variables (or a local .env file)."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./app.db"

    # Required: no default on purpose, so a deployment can never run with a guessable key.
    secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_ttl_minutes: int = 60

    password_reset_ttl_minutes: int = 30
    # The reset email links to {frontend_base_url}/reset-password?token=...
    frontend_base_url: str = "http://localhost:3000"

    # Outgoing email (SMTP). If smtp_host is unset, reset emails are not sent.
    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_from: str = "no-reply@example.com"
    smtp_starttls: bool = True


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
