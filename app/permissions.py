"""Role -> permission map. The single place that decides who may do what."""
from enum import Enum

from app.models import Role


class Permission(str, Enum):
    STAFF_CREATE = "staff:create"
    CATALOG_READ = "catalog:read"  # products, variants, plans, taxes
    CATALOG_WRITE = "catalog:write"


ROLE_PERMISSIONS: dict[Role, frozenset[Permission]] = {
    Role.ADMIN: frozenset(Permission),
    Role.STAFF: frozenset({Permission.CATALOG_READ}),
    Role.CUSTOMER: frozenset(),
}


def has_permission(role: Role, permission: Permission) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, frozenset())
