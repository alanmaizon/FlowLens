"""Local disk document storage for development and single-node deployment."""

from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4


@dataclass(frozen=True)
class LocalStoredObject:
    """Storage key and absolute path for a locally persisted file."""

    key: str
    path: Path


class LocalDocumentStorage:
    """Persist uploaded files under generated keys, never user-supplied paths."""

    def __init__(self, root: Path) -> None:
        self.root = root.resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def save(self, contents: bytes, suffix: str) -> LocalStoredObject:
        """Atomically store bytes under an opaque generated key."""
        normalised_suffix = suffix.lower() if suffix.startswith(".") else f".{suffix.lower()}"
        key = f"{uuid4().hex}{normalised_suffix}"
        target = self.path_for(key)
        temporary = target.with_suffix(f"{target.suffix}.uploading")
        temporary.write_bytes(contents)
        temporary.replace(target)
        return LocalStoredObject(key=key, path=target)

    def path_for(self, key: str) -> Path:
        """Resolve a stored generated key and reject path traversal attempts."""
        candidate = (self.root / key).resolve()
        if candidate.parent != self.root:
            raise ValueError("Invalid storage key")
        return candidate

    def delete(self, key: str) -> None:
        """Remove an object when a database transaction cannot be completed."""
        path = self.path_for(key)
        if path.exists():
            path.unlink()
