import hashlib
import os
from abc import ABC, abstractmethod
from enum import Enum
from io import BytesIO
from pathlib import Path
from typing import Any, Final, override

from minio import Minio

from centralserver.internals.models import BucketObject


class BucketNames(Enum):
    AVATARS = "centralserver-avatars"
    REPORT_EXPORTS = "centralserver-reports"


class ObjectStoreAdapterConfig(ABC):
    """Adapter configuration for object store."""

    @property
    @abstractmethod
    def info(self) -> dict[str, Any]:
        """Get the object store adapter information"""


class ObjectStoreAdapter(ABC):
    """Superclass for object store adapter configuration."""

    @abstractmethod
    def check(self) -> None:
        """Verify the health of the object store."""

    @abstractmethod
    def put(self, bucket: BucketNames, fn: str, obj: bytes) -> BucketObject:
        """Put the object into the object store and return its ID.

        Args:
            bucket: The name of the bucket to put the object into.
            fn: The name of the file in the object store.
            obj: The object to put into the object store.
        """

    @abstractmethod
    def get(self, bucket: BucketNames, hashed_filename: str) -> BucketObject:
        """Get the object with the given ID from the object store."""

    @abstractmethod
    def delete(self, bucket: BucketNames, hashed_filename: str) -> None:
        """Delete the object with the given ID from the object store."""


class LocalObjectStoreAdapterConfig(ObjectStoreAdapterConfig):
    """Adapter configuration for local object store."""

    def __init__(self, filepath: str | None = None) -> None:
        self.filepath: Path = Path(filepath or os.path.join(os.getcwd(), "data"))

    @property
    @override
    def info(self) -> dict[str, Any]:
        """Get the object store adapter information."""

        return {
            "name": "Local",
            "filepath": str(self.filepath),
        }


class LocalObjectStoreAdapter(ObjectStoreAdapter):
    """Use the local filesystem as the central server's object store."""

    _ENCODING: Final[str] = "utf-8"

    def __init__(self, config: LocalObjectStoreAdapterConfig) -> None:
        """Initialize the local object store adapter.

        Args:
            config: The configuration for the local object store.
        """

        self.config = config

    @staticmethod
    def validate_object_name(object_name: str) -> bool:
        """Check if the object name is valid."""

        allowed_symbols = {"-", ".", "_"}
        # NOTE: Object name requirements:
        # - Must be between 3 and 255 characters long.
        # - Must be alphanumeric or one of the following characters: - . _
        # - Must not start or end with symbols.
        return (
            3 <= len(object_name) <= 255
            and all(c.isalnum() or c in allowed_symbols for c in object_name)
            and not (
                object_name[0] in allowed_symbols or object_name[-1] in allowed_symbols
            )
        )

    def get_object_filesystem_filename(self, fn: str) -> str:
        return hashlib.sha256(fn.encode(self._ENCODING)).hexdigest()

    @override
    def check(self) -> None:
        self.config.filepath.mkdir(parents=True, exist_ok=True)
        for directory in BucketNames:
            subdir = self.config.filepath / directory.value
            subdir.mkdir(parents=True, exist_ok=True)

    @override
    def put(self, bucket: BucketNames, fn: str, obj: bytes) -> BucketObject:
        if not self.validate_object_name(fn):
            raise ValueError(f"Invalid object name: {fn}")

        hashed_filename = self.get_object_filesystem_filename(fn)
        new_file_dir = self.config.filepath / bucket.value / hashed_filename[:2]
        new_file_dir.mkdir(parents=True, exist_ok=True)
        new_fp = new_file_dir / hashed_filename
        if new_fp.exists():
            raise FileExistsError("File already exists. Please use a different name.")

        with open(
            self.config.filepath / bucket.value / hashed_filename[:2] / hashed_filename,
            "wb",
        ) as f:
            f.write(obj)

        return BucketObject(
            bucket=bucket.value,
            fn=hashed_filename,
            obj=obj,
        )

    @override
    def get(self, bucket: BucketNames, hashed_filename: str) -> BucketObject:
        object_fp = (
            self.config.filepath / bucket.value / hashed_filename[:2] / hashed_filename
        )
        if not object_fp.exists():
            raise FileNotFoundError(f"File {object_fp} does not exist.")

        data = object_fp.read_bytes()

        return BucketObject(
            bucket=bucket.value,
            fn=hashed_filename,
            obj=data,
        )

    @override
    def delete(self, bucket: BucketNames, hashed_filename: str) -> None:
        object_fp = (
            self.config.filepath / bucket.value / hashed_filename[:2] / hashed_filename
        )
        if not object_fp.exists():
            raise FileNotFoundError(f"File {object_fp} does not exist.")

        os.remove(object_fp)


class MinIOObjectStoreAdapterConfig(ObjectStoreAdapterConfig):
    """Adapter configuration for MinIO."""

    def __init__(
        self,
        access_key: str | None = None,
        secret_key: str | None = None,
        endpoint: str | None = None,
        secure: bool | None = None,
    ):
        """Configuration for MinIO object store adapter.

        Args:
            access_key: The access key for MinIO. (required)
            secret_key: The secret key for MinIO. (required)
            endpoint: The URL of the MinIO server. (default: http://localhost:9000)
            secure: Use secure (TLS) connection. (default: False).
        """

        if access_key is None or secret_key is None:
            raise ValueError("The access key and secret key are required.")

        self.access_key: str = access_key
        self.secret_key: str = secret_key
        self.endpoint: str = endpoint or "http://localhost:9000"
        self.secure: bool = secure or False

    @property
    @override
    def info(self) -> dict[str, Any]:
        return {
            "name": "MinIO",
            "access_key_set": self.access_key != "",
            "secret_key_set": self.secret_key != "",
            "endpoint": self.endpoint,
            "secure": self.secure,
        }


class MinIOObjectStoreAdapter(ObjectStoreAdapter):
    """Use MinIO as the central server's object store."""

    def __init__(self, config: MinIOObjectStoreAdapterConfig):
        """Initialize the MinIO object store adapter.

        Args:
            config: The configuration for the MinIO object store.
        """

        self.config = config

        self.client = Minio(
            config.endpoint,
            access_key=config.access_key,
            secret_key=config.secret_key,
            secure=config.secure,
        )

    @staticmethod
    def validate_object_name(object_name: str) -> bool:
        """Check if the object name is valid."""

        allowed_symbols = {"-", ".", "_"}
        # NOTE: Object name requirements:
        # - Must be between 3 and 255 characters long.
        # - Must be alphanumeric or one of the following characters: - . _
        # - Must not start or end with symbols.
        return (
            3 <= len(object_name) <= 255
            and all(c.isalnum() or c in allowed_symbols for c in object_name)
            and not (
                object_name[0] in allowed_symbols or object_name[-1] in allowed_symbols
            )
        )

    @override
    def check(self) -> None:
        for bucket in BucketNames:
            if not self.client.bucket_exists(bucket.value):
                self.client.make_bucket(bucket.value)

    @override
    def put(self, bucket: BucketNames, fn: str, obj: bytes) -> BucketObject:
        if not self.validate_object_name(fn):
            raise ValueError(f"Invalid object name: {fn}")

        length = len(obj)
        self.client.put_object(
            bucket_name=bucket.value,
            object_name=fn,
            data=BytesIO(obj),
            length=length,
        )

        return BucketObject(
            bucket=bucket.value,
            fn=fn,
            obj=obj,
        )

    @override
    def get(self, bucket: BucketNames, hashed_filename: str) -> BucketObject:
        response = None
        try:
            response = self.client.get_object(
                bucket_name=bucket.value, object_name=hashed_filename
            )
            response_data = response.read()

        finally:
            if response is not None:
                # Close the response to release the connection
                # and avoid resource leaks.
                response.close()
                response.release_conn()

        return BucketObject(
            bucket=bucket.value,
            fn=hashed_filename,
            obj=response_data,
        )

    @override
    def delete(self, bucket: BucketNames, hashed_filename: str) -> None:
        try:
            self.client.remove_object(bucket.value, hashed_filename)
        except Exception as e:
            raise FileNotFoundError(f"File {hashed_filename} does not exist.") from e


def get_object_store_handler(conf: ObjectStoreAdapterConfig) -> ObjectStoreAdapter:
    """Get the appropriate object store adapter based on the configuration.

    Args:
        The object store adapter configuration.

    Returns:
        The object store adapter instance.
    """

    if isinstance(conf, LocalObjectStoreAdapterConfig):
        return LocalObjectStoreAdapter(conf)

    elif isinstance(conf, MinIOObjectStoreAdapterConfig):
        return MinIOObjectStoreAdapter(conf)

    else:
        raise ValueError("Invalid object store configuration.")
