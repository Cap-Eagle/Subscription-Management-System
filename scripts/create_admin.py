"""Create the first admin account (nothing else can create one).

Usage:
    ADMIN_PASSWORD='Str0ng!pass' python -m scripts.create_admin admin@example.com
If ADMIN_PASSWORD is not set, you are prompted for it.
"""
import getpass
import os
import sys

from app.database import get_session_factory
from app.errors import Conflict
from app.models import Role
from app.security import password_problems
from app.services.auth_service import register_user


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    email = sys.argv[1].strip().lower()
    password = os.environ.get("ADMIN_PASSWORD") or getpass.getpass("Admin password: ")

    problems = password_problems(password)
    if problems:
        print("Password must " + "; ".join(problems))
        return 1

    with get_session_factory()() as db:
        try:
            register_user(db, email, password, Role.ADMIN)
        except Conflict as exc:
            print(exc.detail)
            return 1
    print(f"Admin account created for {email}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
