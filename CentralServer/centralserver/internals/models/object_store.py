from sqlmodel import SQLModel


class BucketObject(SQLModel):
    """A model representing an object in a bucket."""

    bucket: str
    fn: str
    obj: bytes
