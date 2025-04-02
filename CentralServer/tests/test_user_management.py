from typing import Any

from fastapi.testclient import TestClient
from passlib.hash import argon2

from centralserver import app

client = TestClient(app)


def test_create_user_success():
    """Test creating a user successfully."""

    data: dict[str, Any] = {
        "username": "testuser",
        "email": "testuser@example.com",
        "nameFirst": "Test",
        "nameMiddle": "Middle",
        "nameLast": "User",
        # "schoolId": 1,
        "roleId": 2,
        "hashed_password": argon2.hash("hashedpassword123"),
    }

    response = client.post(
        "/users/create",
        json=data,
    )
    assert response.status_code == 201
    resp_data: dict[str, Any] = response.json()
    for k, v in data.items():
        assert k in resp_data
        assert resp_data[k] == v


def test_create_user_optional_field():
    """Test creating a user with a missing optional field."""

    data: dict[str, Any] = {
        "username": "testuser2",
        "email": "testuser2@example.com",
        "nameFirst": "Test",
        # nameMiddle is optional
        "nameLast": "User",
        # schoolId is optional
        "roleId": 2,
        "hashed_password": argon2.hash("hashedpassword123"),
        "deactivated": False,
    }

    response = client.post(
        "/users/create",
        json=data,
    )
    assert response.status_code == 201
    resp_data: dict[str, Any] = response.json()
    for k, v in data.items():
        assert k in resp_data
        assert resp_data[k] == v

    assert resp_data["nameMiddle"] is None
    assert resp_data["schoolId"] is None


def test_create_user_missing_required_field():
    """Test creating a user with a missing required field."""

    data: dict[str, Any] = {
        "username": "testuser3",
        "email": "testuser3@example.com",
        "nameFirst": "Test",
        # nameMiddle is optional
        # nameLast is NOT optional
        # schoolId is optional
        "roleId": 2,
        "hashed_password": argon2.hash("hashedpassword123"),
        "deactivated": False,
    }
    response = client.post(
        "/users/create",
        json=data,
    )
    assert response.status_code == 422
    resp_data = response.json()
    assert resp_data["detail"][0]["type"] == "missing"
    assert "nameLast" in resp_data["detail"][0]["loc"]
    assert resp_data["detail"][0]["msg"] == "Field required"


def test_create_user_missing_username():
    """Test creating a user with a missing username."""

    response = client.post(
        "/users/create",
        json={
            "email": "testuser7@example.com",
            "nameFirst": "Test",
            "nameMiddle": "Middle",
            "nameLast": "User",
            "schoolId": 1,
            "roleId": 2,
            "hashed_password": argon2.hash("hashedpassword123"),
            "deactivated": False,
        },
    )
    assert response.status_code == 422
    assert "username" in response.json()["detail"][0]["loc"]


def test_create_user_short_username():
    response = client.post(
        "/users/create",
        json={
            "username": "ab",
            "email": "testuser8@example.com",
            "nameFirst": "Test",
            "nameMiddle": "Middle",
            "nameLast": "User",
            "schoolId": 1,
            "roleId": 2,
            "hashed_password": argon2.hash("hashedpassword123"),
            "deactivated": False,
        },
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid username"


def test_create_user_invalid_data_types():
    """Test creating a user with invalid data types."""

    response = client.post(
        "/users/create",
        json={
            "username": "testuser9",
            "email": "testuser9@example.com",
            "nameFirst": "Test",
            "nameMiddle": "Middle",
            "nameLast": "User",
            "schoolId": "one",  # Invalid type, should be integer
            "roleId": 2,
            "hashed_password": argon2.hash("hashedpassword123"),
        },
    )
    assert response.status_code == 422
    assert "schoolId" in response.json()["detail"][0]["loc"]
