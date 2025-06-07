from sqlmodel import Session

from centralserver.internals.logger import LoggerFactory
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
