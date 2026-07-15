"""Generic repository helpers shared by concrete repositories."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.base import Base


class BaseRepository[ModelT: Base]:
    """Small reusable CRUD base; domain-specific queries remain in child repositories."""

    def __init__(self, session: Session, model_type: type[ModelT]) -> None:
        self.session = session
        self.model_type = model_type

    def get(self, identifier: object) -> ModelT | None:
        """Fetch a model by its primary key."""
        return self.session.get(self.model_type, identifier)

    def list(self) -> list[ModelT]:
        """Fetch all records. Feature repositories should add bounded queries as needed."""
        return list(self.session.scalars(select(self.model_type)))

    def add(self, entity: ModelT) -> ModelT:
        """Add an entity to the pending transaction without committing it."""
        self.session.add(entity)
        return entity
