from sqlmodel import Session, SQLModel, create_engine, select

from centralserver.internals.config_handler import app_config
from centralserver.internals.models import Role

engine = create_engine(
    (
        app_config.test_database.sqlalchemy_uri
        if app_config.debug.use_test_db
        else app_config.database.sqlalchemy_uri
    ),
    connect_args={"check_same_thread": False},
)


def get_db_session():
    with Session(engine) as session:
        yield session


def populate_db():
    """Populate the database with tables."""

    SQLModel.metadata.create_all(bind=engine)

    # Create records for user roles
    with next(get_db_session()) as session:
        if not session.exec(select(Role)).all():
            roles = [
                Role(id=1, description="Superintendent"),
                Role(id=2, description="Administrator"),
                Role(id=3, description="Principal"),
                Role(id=4, description="Canteen Manager"),
            ]
            session.add_all(roles)
            session.commit()
