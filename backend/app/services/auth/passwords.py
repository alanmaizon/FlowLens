"""Password hashing primitives isolated from API and persistence concerns."""

from pwdlib import PasswordHash

password_hash = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Hash a plaintext password with the configured modern password hash."""
    return password_hash.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a persisted hash."""
    return password_hash.verify(password, hashed_password)
