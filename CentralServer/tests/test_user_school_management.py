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


def _request_token(username: str, password: str) -> Response:
    """Log in a user and return the access token."""

    creds: dict[str, str] = {
        "username": username,
        "password": password,
    }

    return client.post("/api/v1/auth/token", data=creds)


def test_create_schools():
    """Test creating schools."""
    token = _request_token("testuser2", "Password123")
    assert token.status_code == 200
    access_token = token.json()["access_token"]

    headers = {"Authorization": f"Bearer {access_token}"}

    for i in range(1, 5):
        response = client.post(
            "/api/v1/schools/create",
            json={"name": f"Test School {i}"},
            headers=headers,
        )
        assert response.status_code == 201
        assert response.json()["name"] == f"Test School {i}"


def test_get_school_quantity():
    """Test getting the total number of schools."""
    token = _request_token(Database.default_user, Database.default_password)
    assert token.status_code == 200
    access_token = token.json()["access_token"]

    headers = {"Authorization": f"Bearer {access_token}"}

    response = client.get("/api/v1/schools/quantity", headers=headers)
    assert response.status_code == 200
    assert response.json() == 4  # Assuming we created 4 schools in the previous test


def test_create_school_without_permission():
    """Test creating a school without permission."""

    token = _request_token("testuser4", "Password123")
    assert token.status_code == 200
    access_token = token.json()["access_token"]
    response = client.post(
        "/api/v1/schools/create",
        json={"name": "Unauthorized School"},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 403
    assert response.json() == {
        "detail": "You do not have permission to create schools."
    }


def test_get_all_schools():
    """Test getting all schools."""
    token = _request_token(Database.default_user, Database.default_password)
    assert token.status_code == 200
    access_token = token.json()["access_token"]

    headers = {"Authorization": f"Bearer {access_token}"}

    response = client.get("/api/v1/schools/all", headers=headers)
    assert response.status_code == 200
    schools = response.json()
    assert isinstance(schools, list)
    assert len(schools) == 4  # type: ignore
