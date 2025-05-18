from typing import Final

from centralserver.internals.models import DefaultRole

DEFAULT_ROLES: Final[tuple[DefaultRole, ...]] = (
    DefaultRole(id=1, description="Website Administrator", modifiable=False),
    DefaultRole(id=2, description="Superintendent", modifiable=False),
    DefaultRole(id=3, description="Administrator", modifiable=False),
    DefaultRole(id=4, description="Principal", modifiable=False),
    DefaultRole(id=5, description="Canteen Manager", modifiable=False),
)

PERMISSIONS: Final[dict[str, str]] = {
    "users:global:create": "Create new users of any role.",
    "users:global:modify": "Modify any user's information.",
    "users:global:read": "View all users' information.",
    "users:global:selfupdate": "Update their own information.",
    "roles:global:read": "View all user roles.",
    "reports:local:write": "Submit daily reports and monthly expenses.",
    "reports:local:read": "View monthly reports of their assigned school.",
}

ROLE_PERMISSIONS: Final[dict[int, list[str]]] = {
    1: [  # Website Administrator
        "users:global:create",
        "users:global:modify",
        "users:global:read",
        "users:global:selfupdate",
        "roles:global:read",
    ],
    2: [  # Superintendent
        "users:global:selfupdate",
        "roles:global:read",
    ],
    3: [  # Administrator
        "users:global:create",
        "users:global:modify",
        "users:global:read",
        "users:global:selfupdate",
        "roles:global:read",
    ],
    4: [  # Principal
        "users:global:selfupdate",
        "reports:local:read",
    ],
    5: [  # Canteen Manager
        "users:global:selfupdate",
        "reports:local:read",
    ],
}
