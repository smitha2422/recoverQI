"""
Recovered-file storage for RecoverIQ.

Handles saving reconstructed files to the recovered directory
and generating safe filenames for downloaded recovery results.
"""

from pathlib import Path
from uuid import uuid4

from .signatures import FILE_SIGNATURES


# Directory where recovered files will be stored.
RECOVERED_DIR = (
    Path(__file__).resolve().parents[2] / "recovered"
)

# Create the directory automatically if it does not exist.
RECOVERED_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


def save_recovered_file(
    file_type: str,
    data: bytes,
) -> dict:
    """
    Save reconstructed file data to the recovered directory.

    Returns information about the saved file.
    """

    if file_type not in FILE_SIGNATURES:
        raise ValueError(
            f"Unsupported file type: {file_type}"
        )

    if not data:
        raise ValueError(
            "Recovered file data cannot be empty."
        )

    extension = FILE_SIGNATURES[file_type]["extension"]

    filename = (
        f"recovered_{file_type}_"
        f"{uuid4().hex[:8]}"
        f"{extension}"
    )

    file_path = RECOVERED_DIR / filename

    file_path.write_bytes(data)

    return {
        "filename": filename,
        "file_type": file_type,
        "size": len(data),
        "path": str(file_path),
    }


def get_recovered_file(
    filename: str,
) -> Path | None:
    """
    Get the path of a recovered file safely.

    Returns:
        Path if the file exists, otherwise None.
    """

    # Prevent path traversal attacks.
    safe_filename = Path(filename).name

    if safe_filename != filename:
        return None

    file_path = RECOVERED_DIR / safe_filename

    if not file_path.is_file():
        return None

    return file_path