from typing import Final

from centralserver.internals.models import Role

ROLES: Final[tuple[Role, ...]] = (
    Role(id=1, description="Superintendent"),
    Role(id=2, description="Administrator"),
    Role(id=3, description="Principal"),
    Role(id=4, description="Canteen Manager"),
)

PERMISSIONS: Final[dict[str, str]] = {
    "users:create": "Create new users of any role.",
    "users:modify": "Modify any user's information.",
    "users:read": "View all users' information.",
}

ROLE_PERMISSIONS: Final[dict[int, list[str]]] = {
    1: ["users:create", "users:modify", "users:read"],  # Superintendent
    2: ["users:create", "users:modify", "users:read"],  # Principal
    3: [],  # Principal
    4: [],  # Canteen Manager
}
