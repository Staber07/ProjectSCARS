from typing import Any

from fastapi.testclient import TestClient
from httpx import Response

from centralserver import app
from centralserver.info import Database

TEST_USERS = {
    "testuser1": 1,
    "testuser2": 2,
    "testuser3": 3,
    "testuser4": 4,
}

client = TestClient(app)


def _request_access_token(username: str, password: str) -> Response:
    """Log in a user and return the access token."""

    creds: dict[str, str] = {
        "username": username,
        "password": password,
    }

    return client.post("/api/v1/auth/token", data=creds)


def test_login_user_success():
    """Test logging in a user successfully."""

    response = _request_access_token(Database.default_user, Database.default_password)
    assert response.status_code == 200
    resp_data: dict[str, Any] = response.json()
    assert type(resp_data["access_token"]) is str
    assert resp_data["token_type"] == "bearer"


def test_login_user_wrong_password():
    """Test failing to log in a user with a wrong password."""

    response = _request_access_token(
        Database.default_user, Database.default_password + "wrong_password"
    )
    assert response.status_code == 401
    resp_data: dict[str, Any] = response.json()
    assert resp_data["detail"] == "Invalid credentials"


def test_login_user_wrong_username():
    """Test failing to log in a user with a wrong username."""

    response = _request_access_token(
        Database.default_user + "wrong_username", Database.default_password
    )
    assert response.status_code == 401
    resp_data: dict[str, Any] = response.json()
    assert resp_data["detail"] == "Invalid credentials"


def test_login_user_wrong_username_and_password():
    """Test failing to log in a user with both username and password wrong."""

    response = _request_access_token(
        Database.default_user + "wrong_username",
        Database.default_password + "wrong_password",
    )
    assert response.status_code == 401
    resp_data: dict[str, Any] = response.json()
    assert resp_data["detail"] == "Invalid credentials"


def test_create_user_success():
    """Test creating a user successfully."""

    login = _request_access_token(Database.default_user, Database.default_password)
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    for user in TEST_USERS.items():
        data: dict[str, Any] = {
            "username": user[0],
            "roleId": user[1],
            "password": "Password123",
        }
        response = client.post(
            "/api/v1/auth/create",
            json=data,
            headers=headers,
        )
        assert response.status_code == 201
        resp_data: dict[str, Any] = response.json()
        assert type(resp_data["id"]) is str
        assert resp_data["username"] == data["username"]
        assert resp_data["email"] is None
        assert resp_data["nameFirst"] is None
        assert resp_data["nameMiddle"] is None
        assert resp_data["nameLast"] is None
        assert resp_data["avatarUrn"] is None
        assert resp_data["schoolId"] is None
        assert resp_data["roleId"] == data["roleId"]
        assert resp_data["deactivated"] is False

    response = client.get("/api/v1/users/get", headers=headers)
    for user in TEST_USERS.items():
        assert user[0] in [u["username"] for u in response.json()]

    assert response.status_code == 200


def test_create_user_missing_required_field():
    """Test creating a user with a missing required field."""

    login = _request_access_token(Database.default_user, Database.default_password)
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    data: dict[str, Any] = {
        "username": "testuser3",
        "password": "Password123",
    }
    response = client.post(
        "/api/v1/auth/create",
        json=data,
        headers=headers,
    )
    assert response.status_code == 422
    resp_data = response.json()
    assert resp_data["detail"][0]["type"] == "missing"
    assert "roleId" in resp_data["detail"][0]["loc"]
    assert resp_data["detail"][0]["msg"] == "Field required"


def test_create_user_missing_username():
    """Test creating a user with a missing username."""

    login = _request_access_token(Database.default_user, Database.default_password)
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    response = client.post(
        "/api/v1/auth/create",
        json={
            "roleId": 2,
            "password": "Password123",
        },
        headers=headers,
    )
    assert response.status_code == 422
    assert "username" in response.json()["detail"][0]["loc"]


def test_create_user_short_username():
    login = _request_access_token(Database.default_user, Database.default_password)
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    response = client.post(
        "/api/v1/auth/create",
        json={
            "username": "ab",
            "roleId": 2,
            "password": "Password123",
        },
        headers=headers,
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid username"


def test_create_user_invalid_data_types():
    """Test creating a user with invalid data types."""

    login = _request_access_token(Database.default_user, Database.default_password)
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    response = client.post(
        "/api/v1/auth/create",
        json={
            "username": 12345,
            "roleId": 2,
            "password": "Password123",
        },
        headers=headers,
    )
    assert response.status_code == 422
    assert "username" in response.json()["detail"][0]["loc"]


def test_create_user_invalid_role_id():
    """Test creating a user with invalid role ID."""

    login = _request_access_token(Database.default_user, Database.default_password)
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    response = client.post(
        "/api/v1/auth/create",
        json={
            "username": "John",
            "roleId": 0,
            "password": "Password123",
        },
        headers=headers,
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid role ID provided."


def test_update_user():
    login = _request_access_token(Database.default_user, Database.default_password)
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    login2 = _request_access_token("testuser2", "Password123")
    headers2 = {"Authorization": f"Bearer {login2.json()['access_token']}"}
    testuser_info = client.get(
        "/api/v1/users/me",
        headers=headers2,
    )
    response = client.patch(
        "/api/v1/users/update",
        json={
            "id": testuser_info.json()["id"],
            "username": "testuser2_new",
        },
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["username"] == "testuser2_new"
    # Revert the change
    response = client.patch(
        "/api/v1/users/update",
        json={
            "id": testuser_info.json()["id"],
            "username": "testuser2",
        },
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["username"] == "testuser2"


def test_update_user_no_permission():
    # TODO: WIP
    login = _request_access_token("testuser4", "Password123")
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    response = client.patch(
        "/api/v1/users/update",
        json={
            "id": "TODO",
        },
        headers=headers,
    )
    assert response.status_code == 403
    assert (
        response.json()["detail"]
        == "You do not have permission to update user profiles. Use `/me/update` to update your own profile."
    )


def test_self_profile_logged_in():
    login = _request_access_token(Database.default_user, Database.default_password)
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    response = client.get(
        "/api/v1/users/me",
        headers=headers,
    )
    assert response.status_code == 200
    resp_data: dict[str, Any] = response.json()
    assert type(resp_data["id"]) is str
    assert resp_data["username"] == Database.default_user
    assert resp_data["email"] is None
    assert resp_data["nameFirst"] is None
    assert resp_data["nameMiddle"] is None
    assert resp_data["nameLast"] is None
    assert resp_data["avatarUrn"] is None
    assert resp_data["schoolId"] is None
    assert resp_data["roleId"] == 1
    assert resp_data["deactivated"] is False


def test_self_profile_logged_out():
    response = client.get(
        "/api/v1/users/me",
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_self_profile_update_name():
    login = _request_access_token("testuser3", "Password123")
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    myself = client.get(
        "/api/v1/users/me",
        headers=headers,
    )
    assert myself.status_code == 200
    resp_data: dict[str, Any] = myself.json()
    response = client.patch(
        "/api/v1/users/me/update",
        json={
            "id": resp_data["id"],
            "nameFirst": "John",
            "nameMiddle": "M.",
            "nameLast": "Doe",
        },
        headers=headers,
    )
    assert response.status_code == 200
    resp_data: dict[str, Any] = response.json()
    assert type(resp_data["id"]) is str
    assert resp_data["username"] == "testuser3"
    assert resp_data["nameFirst"] == "John"
    assert resp_data["nameMiddle"] == "M."
    assert resp_data["nameLast"] == "Doe"


def test_self_profile_update_username_unchanged():
    login = _request_access_token("testuser3", "Password123")
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    myself = client.get(
        "/api/v1/users/me",
        headers=headers,
    )
    assert myself.status_code == 200
    resp_data: dict[str, Any] = myself.json()
    response = client.patch(
        "/api/v1/users/me/update",
        json={
            "id": resp_data["id"],
            "username": "testuser3",
        },
        headers=headers,
    )
    assert response.status_code == 200
    resp_data: dict[str, Any] = response.json()
    assert type(resp_data["id"]) is str
    assert resp_data["username"] == "testuser3"
    assert resp_data["nameFirst"] == "John"
    assert resp_data["nameMiddle"] == "M."
    assert resp_data["nameLast"] == "Doe"


def test_self_profile_update_username_taken():
    login = _request_access_token("testuser3", "Password123")
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    myself = client.get(
        "/api/v1/users/me",
        headers=headers,
    )
    assert myself.status_code == 200
    resp_data: dict[str, Any] = myself.json()
    response = client.patch(
        "/api/v1/users/me/update",
        json={
            "id": resp_data["id"],
            "username": "testuser1",
        },
        headers=headers,
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "Username already exists"


def test_self_profile_update_username_invalid():
    login = _request_access_token("testuser3", "Password123")
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    myself = client.get(
        "/api/v1/users/me",
        headers=headers,
    )
    assert myself.status_code == 200
    resp_data: dict[str, Any] = myself.json()
    response = client.patch(
        "/api/v1/users/me/update",
        json={
            "id": resp_data["id"],
            "username": "never gonna give you up",
        },
        headers=headers,
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid username"


def test_self_profile_update_email_valid():
    login = _request_access_token("testuser3", "Password123")
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    myself = client.get(
        "/api/v1/users/me",
        headers=headers,
    )
    assert myself.status_code == 200
    resp_data: dict[str, Any] = myself.json()
    response = client.patch(
        "/api/v1/users/me/update",
        json={
            "id": resp_data["id"],
            "email": "testuser3@example.com",
        },
        headers=headers,
    )
    assert response.status_code == 200
    resp_data: dict[str, Any] = response.json()
    assert type(resp_data["id"]) is str
    assert resp_data["email"] == "testuser3@example.com"


def test_self_profile_update_email_invalid():
    login = _request_access_token("testuser3", "Password123")
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    myself = client.get(
        "/api/v1/users/me",
        headers=headers,
    )
    assert myself.status_code == 200
    resp_data: dict[str, Any] = myself.json()
    response = client.patch(
        "/api/v1/users/me/update",
        json={
            "id": resp_data["id"],
            "email": "invalid_email",
        },
        headers=headers,
    )
    assert response.status_code == 422
    # TODO: More checks


def test_self_profile_update_password_weak():
    login = _request_access_token("testuser3", "Password123")
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    myself = client.get(
        "/api/v1/users/me",
        headers=headers,
    )
    assert myself.status_code == 200
    resp_data: dict[str, Any] = myself.json()
    response = client.patch(
        "/api/v1/users/me/update",
        json={"id": resp_data["id"], "password": "you"},
        headers=headers,
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid password format"


def test_self_profile_update_password_good():
    login = _request_access_token("testuser3", "Password123")
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    myself = client.get(
        "/api/v1/users/me",
        headers=headers,
    )
    assert myself.status_code == 200
    resp_data: dict[str, Any] = myself.json()
    response = client.patch(
        "/api/v1/users/me/update",
        json={"id": resp_data["id"], "password": "Hunter123"},
        headers=headers,
    )
    assert response.status_code == 200
    # Return to original password
    response = client.patch(
        "/api/v1/users/me/update",
        json={"id": resp_data["id"], "password": "Password123"},
        headers=headers,
    )
    assert response.status_code == 200


def test_self_profile_update_invalid_id():
    login = _request_access_token("testuser3", "Password123")
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    response = client.patch(
        "/api/v1/users/me/update",
        json={
            "id": "INVALID",
            "nameFirst": "John",
            "nameLast": "Doe",
        },
        headers=headers,
    )
    assert response.status_code == 403
    assert (
        response.json()["detail"]
        == "You can only update your own profile. Use `/users/update` if you want to update another user's profile."
    )


def test_view_all_roles():
    login = _request_access_token(Database.default_user, Database.default_password)
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    response = client.get(
        "/api/v1/auth/roles",
        headers=headers,
    )
    assert response.status_code == 200
    roles: list[dict[str, str | int]] = response.json()
    assert type(roles) is list
    for role in roles:
        assert type(role["id"]) is int
        assert type(role["description"]) is str
        assert len(role["description"]) > 0


def test_view_all_roles_no_permission():
    login = _request_access_token("testuser4", "Password123")
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    response = client.get(
        "/api/v1/auth/roles",
        headers=headers,
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "You do not have permission to view all roles."
