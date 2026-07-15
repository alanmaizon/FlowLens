"""Centralised logging configuration."""

import logging


def configure_logging(level: str) -> None:
    """Configure a compact process-wide log format once FastAPI starts."""
    logging.basicConfig(
        level=level.upper(),
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
        force=True,
    )
