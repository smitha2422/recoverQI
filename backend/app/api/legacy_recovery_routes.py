import hashlib
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response


router = APIRouter(
    prefix="/api/recovery",
    tags=["Recovery"],
)

MAX_FILE_SIZE = 50 * 1024 * 1024

# In-memory storage for recovered files.
RECOVERED_FILES = {}


def find_jpeg(data: bytes):
    """Find a JPEG beginning and its ending marker."""
    start = data.find(b"\xFF\xD8\xFF")

    if start == -1:
        return None

    end_marker = data.find(b"\xFF\xD9", start + 3)

    if end_marker == -1:
        return {
            "start": start,
            "end": len(data),
            "data": data[start:],
            "complete": False,
        }

    end = end_marker + 2

    return {
        "start": start,
        "end": end,
        "data": data[start:end],
        "complete": True,
    }


async def read_upload(file: UploadFile) -> bytes:
    """Read an uploaded file and enforce the size limit."""
    data = await file.read(MAX_FILE_SIZE + 1)

    if len(data) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File exceeds the 50 MB size limit.",
        )

    return data


@router.post("/scan")
async def scan_file(file: UploadFile = File(...)):
    data = await read_upload(file)

    if not data:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    matches = []
    jpeg = find_jpeg(data)

    if jpeg:
        matches.append({
            "file_type": "jpeg",
            "start_offset": jpeg["start"],
            "end_offset": jpeg["end"],
            "size": len(jpeg["data"]),
            "is_complete": jpeg["complete"],
        })

    return {
        "filename": file.filename or "uploaded_file",
        "size": len(data),
        "signatures_found": len(matches),
        "matches": matches,
    }


@router.post("/recover")
async def recover_file(file: UploadFile = File(...)):
    data = await read_upload(file)

    if not data:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty.",
        )

    jpeg = find_jpeg(data)

    if not jpeg:
        return {
            "status": "no_recovery_candidates",
            "filename": file.filename or "uploaded_file",
            "signatures_found": 0,
            "fragments_found": 0,
            "recovered_files": 0,
            "fragments": [],
            "reconstructions": {},
        }

    recovered_data = jpeg["data"]
    complete = jpeg["complete"]
    sha256 = hashlib.sha256(recovered_data).hexdigest()

    filename = (
        "recovered_file.jpg"
        if complete
        else "recovered_partial.jpg"
    )

    RECOVERED_FILES[filename] = recovered_data

    fragment = {
        "fragment_id": 1,
        "file_type": "jpeg",
        "start_offset": jpeg["start"],
        "end_offset": jpeg["end"],
        "size": len(recovered_data),
        "is_complete": complete,
    }

    reconstruction = {
        "filename": filename,
        "size": len(recovered_data),
        "confidence_score": 1.0 if complete else 0.5,
        "recovery_status": "complete" if complete else "partial",
        "fragment_ids": [1],
        "sha256": sha256,
        "is_valid": complete,
        "has_valid_header": recovered_data.startswith(
            b"\xFF\xD8\xFF"
        ),
        "has_valid_footer": recovered_data.endswith(
            b"\xFF\xD9"
        ),
    }

    return {
        "status": "recovery_candidate_created",
        "filename": file.filename or "uploaded_file",
        "signatures_found": 1,
        "fragments_found": 1,
        "recovered_files": 1,
        "fragments": [fragment],
        "reconstructions": {
            "jpeg": reconstruction,
        },
    }


@router.get("/download/{filename}")
async def download_recovered_file(filename: str):
    # Prevent directory traversal and only allow stored filenames.
    safe_name = Path(filename).name

    if safe_name != filename or safe_name not in RECOVERED_FILES:
        raise HTTPException(
            status_code=404,
            detail="Recovered file not found.",
        )

    return Response(
        content=RECOVERED_FILES[safe_name],
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{safe_name}"'
            )
        },
    )