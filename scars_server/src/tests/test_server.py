from fastapi.testclient import TestClient
from scars_server import app

client = TestClient(app)


def test_read_index():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello there!"}


def test_add_daily_report():
    payload = {
        "canteen_id": 1,
        "date": "2024-12-11",
        "total_sales": 1024.50,
        "total_purchases": 512.75,
    }
    response = client.put("/api/v1/add", json=payload)
    assert response.status_code == 200
    assert response.json().get("message") == "Daily stats for 2024-12-11 uploaded"
    assert response.json().get("result") == payload
