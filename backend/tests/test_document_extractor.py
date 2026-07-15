import pytest

from app.services.document_extractor import DocumentExtractionError, DocumentTextExtractor


def test_text_extractor_normalises_text_documents() -> None:
    extractor = DocumentTextExtractor()

    extracted = extractor.extract("process-notes.txt", b"Step one  \nStep two\n")

    assert extracted == "Step one\nStep two"


def test_text_extractor_rejects_unsupported_documents() -> None:
    with pytest.raises(DocumentExtractionError, match="Only TXT"):
        DocumentTextExtractor().extract("workflow.xlsx", b"not a workbook")
