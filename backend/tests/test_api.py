from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert data["project"] == "RecoverIQ"
    assert data["status"] == "running"


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200

    assert response.json() == {
        "status": "healthy"
    }


def test_scan_empty_file():
    response = client.post(
        "/api/recovery/scan",
        files={
            "file": (
                "empty.bin",
                b"",
                "application/octet-stream",
            )
        },
    )

    assert response.status_code == 400

    assert response.json()["detail"] == (
       "The uploaded file is empty."
    )


def test_recover_empty_file():
    response = client.post(
        "/api/recovery/recover",
        files={
            "file": (
                "empty.bin",
                b"",
                "application/octet-stream",
            )
        },
    )

    assert response.status_code == 400

    assert response.json()["detail"] == (
        "Uploaded file is empty."
    )


def test_scan_binary_file():
    data = (
        b"RANDOM"
        + b"\xFF\xD8\xFF"
        + b"JPEG DATA"
        + b"\xFF\xD9"
    )

    response = client.post(
        "/api/recovery/scan",
        files={
            "file": (
                "sample.bin",
                data,
                "application/octet-stream",
            )
        },
    )

    assert response.status_code == 200

    result = response.json()

    assert result["filename"] == "sample.bin"
    assert result["size"] == len(data)
    assert result["signatures_found"] == 1
    assert result["matches"][0]["file_type"] == "jpeg"


def test_recover_binary_file():
    data = (
        b"RANDOM"
        + b"\xFF\xD8\xFF"
        + b"JPEG DATA"
        + b"\xFF\xD9"
    )

    response = client.post(
        "/api/recovery/recover",
        files={
            "file": (
                "sample.bin",
                data,
                "application/octet-stream",
            )
        },
    )

    assert response.status_code == 200

    result = response.json()

    assert result["status"] == (
        "recovery_candidate_created"
    )

    assert result["signatures_found"] == 1
    assert result["fragments_found"] == 1
    assert result["recovered_files"] == 1

    assert "jpeg" in result["reconstructions"]

    jpeg = result["reconstructions"]["jpeg"]

    assert jpeg["size"] > 0
    assert jpeg["confidence_score"] == 1.0
    assert jpeg["recovery_status"] == "complete"
    assert len(jpeg["fragment_ids"]) == 1
    assert jpeg["filename"].endswith(".jpg")

    # Integrity information.
    assert len(jpeg["sha256"]) == 64
    assert jpeg["is_valid"] is True
    assert jpeg["has_valid_header"] is True
    assert jpeg["has_valid_footer"] is True

    assert result["fragments"][0]["is_complete"] is True


def test_recover_partial_file():
    data = (
        b"RANDOM"
        + b"\xFF\xD8\xFF"
        + b"INCOMPLETE JPEG"
    )

    response = client.post(
        "/api/recovery/recover",
        files={
            "file": (
                "partial.bin",
                data,
                "application/octet-stream",
            )
        },
    )

    assert response.status_code == 200

    result = response.json()

    assert result["status"] == (
        "recovery_candidate_created"
    )

    assert result["recovered_files"] == 1

    jpeg = result["reconstructions"]["jpeg"]

    assert jpeg["recovery_status"] == "partial"

    # Partial file should have a hash,
    # but should fail complete-file validation.
    assert len(jpeg["sha256"]) == 64
    assert jpeg["is_valid"] is False
    assert jpeg["has_valid_header"] is True
    assert jpeg["has_valid_footer"] is False

    assert result["fragments"][0]["is_complete"] is False


def test_download_nonexistent_file():
    response = client.get(
        "/api/recovery/download/"
        "does_not_exist.jpg"
    )

    assert response.status_code == 404

    assert response.json()["detail"] == (
        "Recovered file not found."
    )