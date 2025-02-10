from models import UserLevel

rules: dict[str, list[UserLevel]] = {
    "user_create": [UserLevel.ADMINISTRATOR, UserLevel.SUPERINTENDENT],
}
