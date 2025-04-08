from typing import Final

from centralserver.internals.models import Role

ROLES: Final[tuple[Role, ...]] = (
    Role(id=1, description="Superintendent"),
    Role(id=2, description="Administrator"),
    Role(id=3, description="Principal"),
    Role(id=4, description="Canteen Manager"),
)

PERMISSIONS: Final[dict[str, str]] = {
    "users:global:create": "Create new users of any role.",
    "users:global:modify": "Modify any user's information.",
    "users:global:read": "View all users' information.",
    "reports:local:write": "Submit daily reports and monthly expenses.",
    "reports:local:read": "View monthly reports of their assigned school.",
}

ROLE_PERMISSIONS: Final[dict[int, list[str]]] = {
    1: [  # Superintendent
        "users:global:create",
        "users:global:modify",
        "users:global:read",
    ],
    2: [  # Administrator
        "users:global:create",
        "users:global:modify",
        "users:global:read",
    ],
    3: ["reports:local:read"],  # Principal
    4: ["reports:local:read"],  # Canteen Manager
}
