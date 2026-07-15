"""Extract textual process evidence from the supported uploaded document formats."""

from io import BytesIO
from pathlib import Path

from docx import Document as WordDocument
from pypdf import PdfReader


class DocumentExtractionError(Exception):
    """Raised when a supported document cannot yield usable text."""


class DocumentTextExtractor:
    """Small, deterministic extraction adapter before richer OCR is introduced."""

    supported_suffixes = frozenset({".txt", ".md", ".csv", ".pdf", ".docx"})

    def extract(self, filename: str, contents: bytes) -> str:
        """Extract and normalise text from a supported file type."""
        suffix = Path(filename).suffix.lower()
        if suffix not in self.supported_suffixes:
            raise DocumentExtractionError(
                "Only TXT, Markdown, CSV, PDF, and DOCX files are supported"
            )

        try:
            if suffix in {".txt", ".md", ".csv"}:
                text = contents.decode("utf-8", errors="replace")
            elif suffix == ".pdf":
                text = "\n".join(
                    page.extract_text() or "" for page in PdfReader(BytesIO(contents)).pages
                )
            else:
                document = WordDocument(BytesIO(contents))
                text = "\n".join(paragraph.text for paragraph in document.paragraphs)
        except Exception as error:
            raise DocumentExtractionError("The document could not be read") from error

        normalised = "\n".join(line.rstrip() for line in text.splitlines()).strip()
        if not normalised:
            raise DocumentExtractionError("No extractable text was found in this document")
        return normalised
