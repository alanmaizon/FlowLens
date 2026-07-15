"""Application service for password-backed registration and login."""

from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.security import create_access_token
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
from app.services.auth.passwords import hash_password, verify_password


class DuplicateEmailError(Exception):
    """Raised when attempting to register an existing email address."""


class InvalidCredentialsError(Exception):
    """Raised when login credentials do not identify an active user."""


class AuthService:
    """Own user registration and password authentication transactions."""

    def __init__(self, session: Session, settings: Settings) -> None:
        self.session = session
        self.settings = settings
        self.users = UserRepository(session)

    def register(self, payload: RegisterRequest) -> TokenResponse:
        """Create an account and issue an access token."""
        email = str(payload.email).lower()
        if self.users.get_by_email(email) is not None:
            raise DuplicateEmailError

        user = User(
            email=email,
            display_name=payload.display_name,
            hashed_password=hash_password(payload.password),
        )
        self.users.add(user)
        self.session.commit()
        self.session.refresh(user)
        return self._token_response(user)

    def login(self, payload: LoginRequest) -> TokenResponse:
        """Verify supplied credentials and issue a new access token."""
        user = self.users.get_by_email(str(payload.email))
        if user is None or not user.is_active or user.hashed_password is None:
            raise InvalidCredentialsError
        if not verify_password(payload.password, user.hashed_password):
            raise InvalidCredentialsError
        return self._token_response(user)

    def _token_response(self, user: User) -> TokenResponse:
        return TokenResponse(
            access_token=create_access_token(str(user.id), self.settings),
            user=UserResponse.model_validate(user),
        )
