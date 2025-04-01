from sqlalchemy import VARCHAR, Column, Integer
from sqlalchemy.ext.declarative import declarative_base

base = declarative_base()


class School(base):
    """A model representing schools in the system."""

    __tablename__ = "schools"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(
        VARCHAR(128), nullable=False, unique=True, comment="The name of the school."
    )
