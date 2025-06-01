from typing import Final

from centralserver.internals.models.user import DefaultRole

DEFAULT_ROLES: Final[tuple[DefaultRole, ...]] = (
    DefaultRole(id=1, description="Website Administrator", modifiable=False),
    DefaultRole(id=2, description="Superintendent", modifiable=False),
    DefaultRole(id=3, description="Administrator", modifiable=False),
    DefaultRole(id=4, description="Principal", modifiable=False),
    DefaultRole(id=5, description="Canteen Manager", modifiable=False),
)

PERMISSIONS: Final[dict[str, str]] = {
    "users:create": "Create new users of any role.",
    "users:global:modify": "Modify any user's information.",
    "users:global:modify:username": "Modify any user's username.",
    "users:global:modify:email": "Modify any user's email address.",
    "users:global:modify:name": "Modify any user's name.",
    "users:global:modify:password": "Modify any user's password.",
    "users:global:modify:avatar": "Modify any user's avatar.",
    "users:global:read": "View all users' information.",
    "users:self:modify": "Modify their own user information.",
    "users:self:modify:username": "Modify their own username.",
    "users:self:modify:email": "Modify their own email address.",
    "users:self:modify:name": "Modify their own name.",
    "users:self:modify:password": "Modify their own password.",
    "users:self:modify:avatar": "Modify their own avatar.",
    "users:self:read": "View their own user information.",
    "roles:global:read": "View all user roles.",
    #####
    "reports:local:write": "Submit daily reports and monthly expenses.",
    "reports:local:read": "View monthly reports of their assigned school.",
}

ROLE_PERMISSIONS: Final[dict[int, list[str]]] = {
    1: [
        "users:create",
        "users:global:modify",
        "users:global:modify:username",
        "users:global:modify:email",
        "users:global:modify:name",
        "users:global:modify:avatar",
        "users:global:read",
        "users:self:modify",
        "users:self:modify:username",
        "users:self:modify:email",
        "users:self:modify:name",
        "users:self:modify:password",
        "users:self:modify:avatar",
        "users:self:read",
        "roles:global:read",
    ],  # Website Administrator
    2: [
        "users:global:read",
        "users:self:modify",
        "users:self:modify:username",
        "users:self:modify:email",
        "users:self:modify:name",
        "users:self:modify:password",
        "users:self:modify:avatar",
        "users:self:read",
        "roles:global:read",
    ],  # Superintendent
    3: [
        "users:global:read",
        "users:self:modify",
        "users:self:modify:username",
        "users:self:modify:email",
        "users:self:modify:name",
        "users:self:modify:password",
        "users:self:modify:avatar",
        "users:self:read",
        "roles:global:read",
    ],  # Administrator
    4: [
        "users:self:modify",
        "users:self:modify:email",
        "users:self:modify:password",
        "users:self:modify:avatar",
        "users:self:read",
    ],  # Principal
    5: [
        "users:self:modify",
        "users:self:modify:email",
        "users:self:modify:password",
        "users:self:modify:avatar",
        "users:self:read",
    ],  # Canteen Manager
}
