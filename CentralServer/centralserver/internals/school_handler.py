import datetime
import uuid

from fastapi import HTTPException, UploadFile, status
from sqlmodel import Session

from centralserver.internals.adapters.object_store import (
    BucketNames,
    get_object_store_handler,
)
from centralserver.internals.config_handler import app_config
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models.object_store import BucketObject
from centralserver.internals.models.school import School, SchoolCreate

logger = LoggerFactory().get_logger(__name__)


async def create_school(new_school: SchoolCreate, session: Session) -> School:
    """Create a new school in the database."""

    school = School(
        name=new_school.name,
        address=new_school.address,
        phone=new_school.phone,
        email=new_school.email,
        website=new_school.website,
    )
    session.add(school)
    session.commit()
    session.refresh(school)
    return school


async def get_school_logo(fn: str) -> BucketObject | None:
    """Fetch the school logo file from the object store."""

    handler = await get_object_store_handler(app_config.object_store)
    return await handler.get(BucketNames.SCHOOL_LOGOS, fn)


async def update_school_logo(
    school_id: int,
    img: UploadFile | None,
    session: Session,
) -> School:
    """Update the school's logo in the object store and database."""

    school = session.get(School, school_id)
    if not school:
        logger.error("School with id %s not found.", school_id)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="School not found.",
        )

    handler = await get_object_store_handler(app_config.object_store)
    if img is None:
        logger.debug("Deleting logo for school_id: %s", school_id)
        if school.logoUrn is None:
            logger.warning("No logo to delete for school_id: %s", school_id)
            raise HTTPException(status_code=400, detail="No logo to delete.")

        await handler.delete(BucketNames.SCHOOL_LOGOS, school.logoUrn)
        school.logoUrn = None

    else:
        if school.logoUrn is not None:
            logger.debug("Deleting old logo for school_id: %s", school_id)
            await handler.delete(BucketNames.SCHOOL_LOGOS, school.logoUrn)

        logger.debug("Updating logo for school_id: %s", school_id)
        new_fn = uuid.uuid4().hex
        await handler.put(BucketNames.SCHOOL_LOGOS, new_fn, await img.read())
        school.logoUrn = new_fn

    school.lastModified = datetime.datetime.now(datetime.timezone.utc)

    session.add(school)
    session.commit()
    session.refresh(school)
    logger.info("School logo updated for school_id=%s", school_id)
    return school
