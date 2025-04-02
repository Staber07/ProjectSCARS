from sqlmodel import Session, SQLModel, create_engine, select

from centralserver import info
from centralserver.internals.auth_handler import get_hashed_password
from centralserver.internals.config_handler import app_config
from centralserver.internals.logger import LoggerFactory
from centralserver.internals.models import NewUser, Role, User
from centralserver.internals.user_handler import create_user

logger = LoggerFactory().get_logger(__name__)
engine = create_engine(
    (
        app_config.test_database.sqlalchemy_uri
        if app_config.debug.use_test_db
        else app_config.database.sqlalchemy_uri
    ),
    connect_args={"check_same_thread": False},
)


def get_db_session():
    logger.debug("Creating a new database session")
    with Session(engine) as session:
        yield session


def populate_db():
    """Populate the database with tables."""

    logger.debug("Creating database tables")
    SQLModel.metadata.create_all(bind=engine)

    # Create records for user roles
    with next(get_db_session()) as session:
        if not session.exec(select(Role)).all():
            logger.debug("Creating default roles")
            roles = [
                Role(id=1, description="Superintendent"),
                Role(id=2, description="Administrator"),
                Role(id=3, description="Principal"),
                Role(id=4, description="Canteen Manager"),
            ]
            session.add_all(roles)
            session.commit()

    # Create default superintendent user
    with next(get_db_session()) as session:
        if not session.exec(select(User)).first():
            logger.debug("Creating default user")
            create_user(
                NewUser(
                    username=info.Database.default_user,
                    roleId=1,
                    plaintext_password=info.Database.default_password,
                ),
                session,
            )
