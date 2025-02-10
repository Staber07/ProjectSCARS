from models import UserLevel

rules: dict[str, list[UserLevel]] = {
    "user_create": [UserLevel.ADMINISTRATOR, UserLevel.SUPERINTENDENT],
    "user_modify": [UserLevel.ADMINISTRATOR, UserLevel.SUPERINTENDENT],
    "user_delete": [UserLevel.ADMINISTRATOR, UserLevel.SUPERINTENDENT],
}
