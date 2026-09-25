"""
File integrity utilities for RecoverIQ.

Provides SHA-256 hashing and basic recovered-file validation.
"""

import hashlib

from .signatures import FILE_SIGNATURES


def calculate_sha256(data: bytes) -> str:
    """
    Calculate the SHA-256 hash of binary data.
    """

    return hashlib.sha256(data).hexdigest()


def validate_recovered_file(
    file_type: str,
    data: bytes,
) -> dict:
    """
    Perform basic validation of recovered file data.

    Checks:
    1. File type is supported.
    2. Data is not empty.
    3. Expected file header exists.
    4. Expected footer exists.

    Returns validation information.
    """

    if file_type not in FILE_SIGNATURES:
        return {
            "is_valid": False,
            "reason": "Unsupported file type.",
        }

    if not data:
        return {
            "is_valid": False,
            "reason": "Recovered file is empty.",
        }

    signature = FILE_SIGNATURES[file_type]

    has_header = data.startswith(
        signature["header"]
    )

    has_footer = data.endswith(
        signature["footer"]
    )

    return {
        "is_valid": (
            has_header
            and has_footer
        ),
        "has_valid_header": has_header,
        "has_valid_footer": has_footer,
    }


def build_integrity_report(
    file_type: str,
    data: bytes,
) -> dict:
    """
    Build a complete integrity report for
    a recovered file.
    """

    validation = validate_recovered_file(
        file_type,
        data,
    )

    return {
        "sha256": calculate_sha256(data),
        **validation,
    }