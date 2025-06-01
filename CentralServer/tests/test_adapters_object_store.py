import os

from centralserver.internals.adapters.config import (
    GarageObjectStoreAdapterConfig,
    LocalObjectStoreAdapterConfig,
    MinIOObjectStoreAdapterConfig,
)


def test_valid_local_config():
    """Test the Local object store configuration."""

    config = LocalObjectStoreAdapterConfig("pytest-path")

    assert config.info["filepath"] == "pytest-path"


def test_empty_local_config():
    """Test the Local object store configuration with empty filepath."""

    config = LocalObjectStoreAdapterConfig()

    # Default is used if empty string
    assert config.info["filepath"] == os.path.join(os.getcwd(), "data")


def test_valid_minio_config():
    """Test the MinIO object store configuration."""

    config = MinIOObjectStoreAdapterConfig(
        access_key="bf51e071508becb67bf2263c9f60403f",
        secret_key="533af9863ea0252a5607bb397dbc3fc1",
    )

    assert config.info["access_key_set"] is True
    assert config.info["secret_key_set"] is True
    assert config.info["endpoint"] == "localhost:9000"
    assert config.info["secure"] is False


def test_no_access_key_minio_config():
    """Test the MinIO object store configuration with no access key."""

    sk = "533af9863ea0252a5607bb397dbc3fc1"
    try:
        _ = MinIOObjectStoreAdapterConfig(
            secret_key=sk,
        )

    except ValueError:
        pass

    else:
        raise AssertionError("ValueError not raised")


def test_no_secret_key_minio_config():
    """Test the MinIO object store configuration with no secret key."""

    ak = "bf51e071508becb67bf2263c9f60403f"
    try:
        _ = MinIOObjectStoreAdapterConfig(
            access_key=ak,
        )

    except ValueError:
        pass

    else:
        raise AssertionError("ValueError not raised")


def test_valid_garage_config():
    """Test the Garage object store configuration."""

    config = GarageObjectStoreAdapterConfig(
        access_key="GKb92bd72e1ae26740d62fbb83",
        secret_key="501b94b27eb2c87ff02fceec96cd4748a7aa1f043e1e8c12cfc6c0a8797e9bfd",
    )

    assert config.info["access_key_set"] is True
    assert config.info["secret_key_set"] is True
    assert config.info["endpoint"] == "localhost:3900"
    assert config.info["secure"] is False


def test_no_access_key_garage_config():
    """Test the Garage object store configuration with no access key."""

    sk = "501b94b27eb2c87ff02fceec96cd4748a7aa1f043e1e8c12cfc6c0a8797e9bfd"
    try:
        _ = GarageObjectStoreAdapterConfig(
            secret_key=sk,
        )

    except ValueError:
        pass

    else:
        raise AssertionError("ValueError not raised")


def test_no_secret_key_garage_config():
    """Test the Garage object store configuration with no secret key."""

    ak = "GKb92bd72e1ae26740d62fbb83"
    try:
        _ = GarageObjectStoreAdapterConfig(
            access_key=ak,
        )

    except ValueError:
        pass

    else:
        raise AssertionError("ValueError not raised")
