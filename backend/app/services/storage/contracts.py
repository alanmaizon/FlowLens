"""Object-storage boundary for document files."""

from pathlib import Path
from typing import Protocol


class StoredObject(Protocol):
    """Reference to a safely persisted document object."""

    key: str
    path: Path


class DocumentStorage(Protocol):
    """Store and retrieve document bytes independently of the chosen backend."""

    def save(self, contents: bytes, suffix: str) -> StoredObject: ...

    def path_for(self, key: str) -> Path: ...

    def delete(self, key: str) -> None: ...
