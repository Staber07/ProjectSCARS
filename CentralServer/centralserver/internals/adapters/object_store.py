import os
from abc import ABC, abstractmethod
from enum import Enum
from io import BytesIO
from typing import Final, override

from minio import Minio
from PIL import Image

from centralserver.internals.adapters.config import (
    GarageObjectStoreAdapterConfig,
    LocalObjectStoreAdapterConfig,
    MinIOObjectStoreAdapterConfig,
    ObjectStoreAdapterConfig,
)
from centralserver.internals.config_handler import app_config
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models.object_store import BucketObject

logger = LoggerFactory().get_logger(__name__)


class BucketNames(Enum):
    """Names of the buckets in the object store."""

    AVATARS = "centralserver-avatars"  # Contains user profile pictures
    SCHOOL_LOGOS = "centralserver-school-logos"  # Contains school logos
    REPORT_EXPORTS = "centralserver-reports"  # Contains exported reports


async def validate_and_process_image(contents: bytes) -> bytes:
    """Validate and process an image file.

    Args:
        contents: The raw bytes of the image file.

    Returns:
        The processed image bytes.

    Raises:
        ValueError: If the image is invalid or exceeds the size limit.
    """

    allowed_fs = app_config.object_store.max_file_size / (1024 * 1024)
    allowed_ft = ", ".join(app_config.object_store.allowed_image_types)

    if len(contents) > app_config.object_store.max_file_size:
        size_mb = len(contents) / (1024 * 1024)
        raise ValueError(
            f"Image size {size_mb:.2f} MB exceeds the {allowed_fs:.2f} MB size limit."
        )

    try:
        image = Image.open(BytesIO(contents))
        if image.format is None:
            raise ValueError("Image format not recognized.")

        if image.format not in app_config.object_store.allowed_image_types:
            raise ValueError(
                f"Unsupported image format: {image.format}. Allowed: {allowed_ft}."
            )

    except Exception as e:
        raise ValueError("Invalid image file.") from e

    width, height = image.size
    min_dim = min(width, height)
    dimensions = (
        int((width - min_dim) / 2),  # left
        int((height - min_dim) / 2),  # top
        int((width + min_dim) / 2),  # right
        int((height + min_dim) / 2),  # bottom
    )
    image = image.crop(dimensions)

    output_buffer = BytesIO()
    image.save(output_buffer, format=image.format)
    return output_buffer.getvalue()


class ObjectStoreAdapter(ABC):
    """Superclass for object store adapter configuration."""

    @abstractmethod
    async def check(self) -> None:
        """Verify the health of the object store."""

    @abstractmethod
    async def put(self, bucket: BucketNames, fn: str, obj: bytes) -> BucketObject:
        """Put the object into the object store and return its ID.

        Args:
            bucket: The name of the bucket to put the object into.
            fn: The name of the file in the object store.
            obj: The object to put into the object store.
        """

    @abstractmethod
    async def get(
        self, bucket: BucketNames, hashed_filename: str
    ) -> BucketObject | None:
        """Get the object with the given ID from the object store."""

    @abstractmethod
    async def delete(self, bucket: BucketNames, hashed_filename: str) -> None:
        """Delete the object with the given ID from the object store."""


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
    async def validate_object_name(object_name: str) -> bool:
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
    async def check(self) -> None:
        """Check if the local object store is healthy."""

        logger.debug("Ensuring existence of local object store directories.")
        self.config.filepath.mkdir(parents=True, exist_ok=True)
        for directory in BucketNames:
            logger.debug("Ensuring existence of directory: %s", directory.value)
            subdir = self.config.filepath / directory.value
            subdir.mkdir(parents=True, exist_ok=True)

    @override
    async def put(self, bucket: BucketNames, fn: str, obj: bytes) -> BucketObject:
        """Store the object in the local object store.

        Args:
            bucket: The name of the bucket to put the object into.
            fn: The name of the file in the object store.
            obj: The object to put into the object store.
        """

        logger.debug("Putting object into local object store.")
        if not await self.validate_object_name(fn):
            logger.warning("Invalid object name: %s", fn)
            raise ValueError(f"Invalid object name: {fn}")

        new_file_dir = self.config.filepath / bucket.value / fn[:2]
        new_file_dir.mkdir(parents=True, exist_ok=True)
        new_fp = new_file_dir / fn
        if new_fp.exists():
            logger.warning("File already exists: %s", new_fp)
            raise FileExistsError("File already exists. Please use a different name.")

        with open(
            self.config.filepath / bucket.value / fn[:2] / fn,
            "wb",
        ) as f:
            f.write(obj)

        return BucketObject(
            bucket=bucket.value,
            fn=fn,
            obj=obj,
        )

    @override
    async def get(
        self, bucket: BucketNames, hashed_filename: str
    ) -> BucketObject | None:
        """Retrieve an object from the local object store.

        Args:
            bucket: The name of the bucket to get the object from.
            hashed_filename: The hashed filename of the object to retrieve.
        """

        logger.debug("Getting object from local object store.")
        object_fp = (
            self.config.filepath / bucket.value / hashed_filename[:2] / hashed_filename
        )
        if not object_fp.exists():
            logger.warning("File does not exist: %s", object_fp)
            return None

        data = object_fp.read_bytes()

        return BucketObject(
            bucket=bucket.value,
            fn=hashed_filename,
            obj=data,
        )

    @override
    async def delete(self, bucket: BucketNames, hashed_filename: str) -> None:
        """Remove an object from the local object store.

        Args:
            bucket: The name of the bucket to delete the object from.
            hashed_filename: The hashed filename of the object to delete.
        """

        logger.debug("Deleting object from local object store.")
        object_fp = (
            self.config.filepath / bucket.value / hashed_filename[:2] / hashed_filename
        )
        if not object_fp.exists():
            logger.warning("File does not exist: %s", object_fp)
            raise FileNotFoundError(f"File {object_fp} does not exist.")

        os.remove(object_fp)


class MinIOObjectStoreAdapter(ObjectStoreAdapter):
    """Use MinIO as the central server's object store."""

    def __init__(self, config: MinIOObjectStoreAdapterConfig):
        """Initialize the MinIO object store adapter.

        Args:
            config: The configuration for the MinIO object store.
        """

        self.config = config

        logger.debug("Initializing MinIO object store adapter.")
        self.client = Minio(
            config.endpoint,
            access_key=config.access_key,
            secret_key=config.secret_key,
            secure=config.secure,
        )

    @staticmethod
    async def validate_object_name(object_name: str) -> bool:
        """Check if the object name is valid.

        Args:
            object_name: The name of the object to validate.
        """

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
    async def check(self) -> None:
        """Check if the MinIO object store is healthy."""

        logger.debug("Ensuring existence of MinIO buckets.")
        for bucket in BucketNames:
            logger.debug("Ensuring existence of bucket: %s", bucket.value)
            if not self.client.bucket_exists(bucket.value):
                logger.debug("Creating bucket: %s", bucket.value)
                self.client.make_bucket(bucket.value)

    @override
    async def put(self, bucket: BucketNames, fn: str, obj: bytes) -> BucketObject:
        """Upload an object to the MinIO object store.

        Args:
            bucket: The name of the bucket to put the object into.
            fn: The name of the file in the object store.
            obj: The object to put into the object store.
        """

        logger.debug("Putting object into MinIO object store.")
        if not await self.validate_object_name(fn):
            logger.warning("Invalid object name: %s", fn)
            raise ValueError(f"Invalid object name: {fn}")

        length = len(obj)
        logger.debug("Object length: %d", length)
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
    async def get(
        self, bucket: BucketNames, hashed_filename: str
    ) -> BucketObject | None:
        """Retrieve an object from the MinIO object store.

        Args:
            bucket: The name of the bucket to get the object from.
            hashed_filename: The hashed filename of the object to retrieve.
        """

        logger.debug("Getting object from MinIO object store.")
        response = None
        try:
            logger.debug("Retrieving object: %s", hashed_filename)
            response = self.client.get_object(
                bucket_name=bucket.value, object_name=hashed_filename
            )
            logger.debug("Object retrieved successfully. Reading...")
            response_data = response.read()

        finally:
            if response is not None:
                logger.debug("Closing MinIO response.")
                # Close the response to release the connection
                # and avoid resource leaks.
                response.close()  # WARN: Why are these not implemented according to source?
                response.release_conn()

        return BucketObject(
            bucket=bucket.value,
            fn=hashed_filename,
            obj=response_data,
        )

    @override
    async def delete(self, bucket: BucketNames, hashed_filename: str) -> None:
        """Remove an object from the MinIO object store.

        Args:
            bucket: The name of the bucket to delete the object from.
            hashed_filename: The hashed filename of the object to delete.
        """

        logger.debug("Deleting object from MinIO object store.")
        try:
            self.client.remove_object(bucket.value, hashed_filename)

        except Exception as e:
            logger.warning("File does not exist: %s", hashed_filename)
            raise FileNotFoundError(f"File {hashed_filename} does not exist.") from e


class GarageObjectStoreAdapter(ObjectStoreAdapter):
    """Use Garage as the central server's object store."""

    def __init__(self, config: GarageObjectStoreAdapterConfig):
        """Initialize the Garage object store adapter.

        Args:
            config: The configuration for the Garage object store.
        """

        self.config = config

        logger.debug("Initializing Garage object store adapter.")
        self.client = Minio(
            config.endpoint,
            access_key=config.access_key,
            secret_key=config.secret_key,
            secure=config.secure,
            region="garage",  # Garage uses a specific region
        )

    @staticmethod
    async def validate_object_name(object_name: str) -> bool:
        """Check if the object name is valid.

        Args:
            object_name: The name of the object to validate.
        """

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
    async def check(self) -> None:
        """Check if the Garage object store is healthy."""

        logger.debug("Ensuring existence of Garage buckets.")
        for bucket in BucketNames:
            logger.debug("Ensuring existence of bucket: %s", bucket.value)
            if not self.client.bucket_exists(bucket.value):
                logger.debug("Creating bucket: %s", bucket.value)
                self.client.make_bucket(bucket.value)

    @override
    async def put(self, bucket: BucketNames, fn: str, obj: bytes) -> BucketObject:
        """Upload an object to the Garage object store.

        Args:
            bucket: The name of the bucket to put the object into.
            fn: The name of the file in the object store.
            obj: The object to put into the object store.
        """

        logger.debug("Putting object into Garage object store.")
        if not await self.validate_object_name(fn):
            logger.warning("Invalid object name: %s", fn)
            raise ValueError(f"Invalid object name: {fn}")

        length = len(obj)
        logger.debug("Object length: %d", length)
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
    async def get(
        self, bucket: BucketNames, hashed_filename: str
    ) -> BucketObject | None:
        """Retrieve an object from the Garage object store.

        Args:
            bucket: The name of the bucket to get the object from.
            hashed_filename: The hashed filename of the object to retrieve.
        """

        logger.debug("Getting object from Garage object store.")
        response = None
        try:
            logger.debug("Retrieving object: %s", hashed_filename)
            response = self.client.get_object(
                bucket_name=bucket.value, object_name=hashed_filename
            )
            logger.debug("Object retrieved successfully. Reading...")
            response_data = response.read()

        finally:
            if response is not None:
                logger.debug("Closing Garage response.")
                # Close the response to release the connection
                # and avoid resource leaks.
                response.close()  # WARN: Why are these not implemented according to source?
                response.release_conn()

        return BucketObject(
            bucket=bucket.value,
            fn=hashed_filename,
            obj=response_data,
        )

    @override
    async def delete(self, bucket: BucketNames, hashed_filename: str) -> None:
        """Remove an object from the Garage object store.

        Args:
            bucket: The name of the bucket to delete the object from.
            hashed_filename: The hashed filename of the object to delete.
        """

        logger.debug("Deleting object from Garage object store.")
        try:
            self.client.remove_object(bucket.value, hashed_filename)

        except Exception as e:
            logger.warning("File does not exist: %s", hashed_filename)
            raise FileNotFoundError(f"File {hashed_filename} does not exist.") from e


async def get_object_store_handler(
    conf: ObjectStoreAdapterConfig,
) -> ObjectStoreAdapter:
    """Get the appropriate object store adapter based on the configuration.

    Args:
        The object store adapter configuration.

    Returns:
        The object store adapter instance.
    """

    if isinstance(conf, LocalObjectStoreAdapterConfig):
        logger.debug("Using local object store adapter.")
        return LocalObjectStoreAdapter(conf)

    elif isinstance(conf, MinIOObjectStoreAdapterConfig):
        logger.debug("Using MinIO object store adapter.")
        return MinIOObjectStoreAdapter(conf)

    elif isinstance(conf, GarageObjectStoreAdapterConfig):
        logger.debug("Using Garage object store adapter.")
        return GarageObjectStoreAdapter(conf)

    else:
        logger.error("Invalid object store configuration.")
        raise ValueError("Invalid object store configuration.")
