import datetime
import uuid
from sqlmodel import Session

from centralserver.internals.auth_handler import verify_user_permission
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models.school import School
from centralserver.internals.models.token import DecodedJWTToken
from centralserver.internals.adapters.object_store import get_object_store_handler, BucketNames
from centralserver.internals.config_handler import app_config
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models.school import School, SchoolCreate
from minio.error import S3Error
from PIL import Image

from fastapi import HTTPException, UploadFile, status
from io import BytesIO

MAX_FILE_SIZE = 2 * 1024 * 1024  # 2 MB
ALLOWED_IMAGE_TYPES = {"png", "jpeg", "jpg", "webp"}

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

async def get_school_logo(fn: str):
    """Fetch the school logo file from the object store."""
    handler = await get_object_store_handler(app_config.object_store)
    try:
        bucket_object = await handler.get(BucketNames.SCHOOL_LOGOS, fn)
        return bucket_object
    except S3Error as e:
        logger.error(f"Error fetching school logo '{fn}': {e}")
        return None

async def validate_and_process_image(file: UploadFile) -> bytes:
    contents = await file.read()  

    if len(contents) > MAX_FILE_SIZE:
        size_mb = len(contents) / (1024 * 1024)
        raise HTTPException(
            status_code=400,
            detail=f"Image size {size_mb:.2f} MB exceeds the 2 MB size limit."
        )

    try:
        image = Image.open(BytesIO(contents))
        if image.format is None:
            raise HTTPException(status_code=400, detail="Image format not recognized.")
        image_format = image.format.lower()
        format_map = {"jpg": "JPEG", "jpeg": "JPEG", "png": "PNG", "webp": "WEBP"}
        save_format = format_map.get(image_format, image_format.upper())
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file.")

    if image_format not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format: {image_format}. Allowed: PNG, JPG, JPEG, WEBP.",
        )

    
    width, height = image.size
    min_dim = min(width, height)
    left = int((width - min_dim) / 2)
    top = int((height - min_dim) / 2)
    right = int((width + min_dim) / 2)
    bottom = int((height + min_dim) / 2)
    image = image.crop((left, top, right, bottom))

    output_buffer = BytesIO()
    image.save(output_buffer, format=save_format)
    return output_buffer.getvalue()


async def update_school_logo(
    school_id: int,
    img: bytes | None,
    token: DecodedJWTToken,
    session: Session,
) -> School:
    """Update the school's logo in the object store and database."""
    school = session.get(School, school_id)
    if not school:
        logger.warning("Failed to update school logo: %s (school not found)", school_id)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="School not found.")

    if not await verify_user_permission("schools:global:modify", session=session, token=token):
        logger.warning("Permission denied: Cannot modify school logo for school_id=%s", school_id)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Permission denied.")

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
        new_filename = f"school-logo-{school_id}-{uuid.uuid4().hex}.png"
        await handler.put(BucketNames.SCHOOL_LOGOS, new_filename, img)
        school.logoUrn = new_filename

    school.lastModified = datetime.datetime.now(datetime.timezone.utc)

    session.add(school)
    session.commit()
    session.refresh(school)
    logger.info("School logo updated for school_id=%s", school_id)
    return school