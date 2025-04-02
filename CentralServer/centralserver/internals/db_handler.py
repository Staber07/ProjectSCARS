from typing import Annotated

from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

from centralserver.internals.config_handler import app_config

Base = declarative_base()


engine = create_engine(
    (
        app_config.test_database.sqlalchemy_uri
        if app_config.debug.use_test_db
        else app_config.database.sqlalchemy_uri
    ),
    connect_args={"check_same_thread": False},
)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Get database session."""

    db = SessionLocal()
    try:
        yield db

    finally:
        db.close()


db_dep = Annotated[Session, Depends(get_db)]  # FastAPI dependency injection
