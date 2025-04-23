from abc import ABC, abstractmethod
from typing import Any, BinaryIO, Final, override

from minio import Minio

from centralserver.internals.logger import LoggerFactory

logger = LoggerFactory().get_logger(__name__)


class ObjectStoreAdapter(ABC):
    """Superclass for object store adapter configuration."""

    @abstractmethod
    def put(self, bucket: str, fn: str, obj: bytes) -> str:
        """Put the object into the object store and return its ID.

        Args:
            bucket: The name of the bucket to put the object into.
            fn: The name of the file in the object store.
            obj: The object to put into the object store.

        Returns:
            The ID of the object in the object store.
        """

        pass

    @abstractmethod
    def get(self, id: str) -> dict[str, Any]:
        """Get the object with the given ID from the object store."""
        pass


class MinIOObjectStoreAdapterConfig:
    """Adapter configuration for MinIO."""

    def __init__(
        self,
        endpoint: str,
        access_key: str,
        secret_key: str,
        secure: bool = False,
    ):
        """Configuration for MinIO object store adapter.

        Args:
            endpoint: The URL of the MinIO server.
            access_key: The access key for MinIO.
            secret_key: The secret key for MinIO.
            secure: Use secure (TLS) connection. (default: False).
        """

        self.endpoint = endpoint
        self.access_key = access_key
        self.secret_key = secret_key
        self.secure = secure


class MinIOObjectStoreAdapter(ObjectStoreAdapter):
    """Use MinIO as the central server's object store."""

    BUCKET_NAMES: Final[set[str]] = {
        "centralserver-avatars",
        "centralserver-reports",
    }

    def __init__(self, config: MinIOObjectStoreAdapterConfig):
        """Initialize the MinIO object store adapter.

        Args:
            config: The configuration for the MinIO object store.
        """

        self.config = config

        logger.debug("Connecting to MinIO object store...")
        self.client = Minio(
            config.endpoint,
            access_key=config.access_key,
            secret_key=config.secret_key,
            secure=config.secure,
        )

        self.check_buckets()

    def check_buckets(self) -> None:
        logger.debug("Checking MinIO buckets...")
        for bucket in self.BUCKET_NAMES:
            logger.debug(f"Checking bucket: {bucket}")
            if not self.client.bucket_exists(bucket):
                logger.info(f"Bucket {bucket} does not exist. Creating...")
                self.client.make_bucket(bucket)

            else:
                logger.debug(f"Bucket {bucket} already exists.")

    @override
    def put(self, bucket: str, fn: str, obj: BinaryIO) -> str:
        logger.debug(f"Putting object {fn} into bucket {bucket}...")
        # TODO: WIP
