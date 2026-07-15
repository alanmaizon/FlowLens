"""Document upload application service."""

from pathlib import Path
from uuid import UUID

from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.models.document import Document, DocumentStatus
from app.repositories.document_repository import DocumentRepository
from app.services.document_extractor import DocumentExtractionError, DocumentTextExtractor
from app.services.storage.local import LocalDocumentStorage


class DocumentUploadError(Exception):
    """Raised when an upload violates FlowLens source-document constraints."""


class DocumentService:
    """Validate, store, extract, and persist documents as one application transaction."""

    def __init__(self, session: Session, settings: Settings) -> None:
        self.session = session
        self.settings = settings
        self.documents = DocumentRepository(session)
        self.storage = LocalDocumentStorage(settings.storage_local_path)
        self.extractor = DocumentTextExtractor()

    async def upload(self, project_id: UUID, upload: UploadFile) -> Document:
        """Persist an upload and its extracted evidence under the project boundary."""
        filename = Path(upload.filename or "document").name
        suffix = Path(filename).suffix.lower()
        if suffix not in self.extractor.supported_suffixes:
            raise DocumentUploadError("Only TXT, Markdown, CSV, PDF, and DOCX files are supported")

        contents = await upload.read(self.settings.max_upload_size_bytes + 1)
        await upload.close()
        if not contents:
            raise DocumentUploadError("The uploaded file is empty")
        if len(contents) > self.settings.max_upload_size_bytes:
            raise DocumentUploadError("The uploaded file exceeds the 25 MB limit")

        try:
            extracted_text = self.extractor.extract(filename, contents)
        except DocumentExtractionError as error:
            raise DocumentUploadError(str(error)) from error

        stored = self.storage.save(contents, suffix)
        try:
            document = Document(
                project_id=project_id,
                filename=filename,
                content_type=upload.content_type or "application/octet-stream",
                storage_key=stored.key,
                size_bytes=len(contents),
                status=DocumentStatus.READY,
                extracted_text=extracted_text,
            )
            self.documents.add(document)
            self.session.commit()
            self.session.refresh(document)
        except Exception:
            self.session.rollback()
            self.storage.delete(stored.key)
            raise
        return document
