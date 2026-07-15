"""User persistence queries."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Persistence gateway for users and future external identities."""

    def __init__(self, session: Session) -> None:
        super().__init__(session, User)

    def get_by_email(self, email: str) -> User | None:
        """Find a user by its normalised email address."""
        return self.session.scalar(select(User).where(User.email == email.lower()))
