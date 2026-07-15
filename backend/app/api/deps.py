"""Reusable FastAPI dependencies for authenticated, transaction-scoped requests."""

from typing import Annotated
from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import decode_access_token
from app.database.session import get_db_session
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
DatabaseSession = Annotated[Session, Depends(get_db_session)]


def get_current_user(
    session: DatabaseSession,
    token: Annotated[str, Depends(oauth2_scheme)],
) -> User:
    """Resolve a verified bearer token to its active persisted user."""
    try:
        payload = decode_access_token(token, get_settings())
        subject = payload.get("sub")
        user_id = UUID(subject) if isinstance(subject, str) else None
    except (ValueError, jwt.PyJWTError):
        user_id = None

    user = session.get(User, user_id) if user_id is not None else None
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
