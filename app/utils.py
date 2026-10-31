from datetime import datetime, timezone


def utcnow() -> datetime:
    """Current UTC time as a naive datetime.

    All timestamp columns store naive UTC so behaviour is identical on SQLite and PostgreSQL.
    """
    return datetime.now(timezone.utc).replace(tzinfo=None)
