"""Declarative SQLAlchemy base shared by all persistence models."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base for FlowLens database models."""
