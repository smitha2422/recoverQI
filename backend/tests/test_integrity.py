from app.core.integrity import (
    calculate_sha256,
    validate_recovered_file,
    build_integrity_report,
)


def test_calculate_sha256():
    data = b"RecoverIQ"

    result = calculate_sha256(data)

    assert len(result) == 64
    assert result.isalnum()


def test_validate_complete_jpeg():
    data = (
        b"\xFF\xD8\xFF"
        + b"JPEG DATA"
        + b"\xFF\xD9"
    )

    result = validate_recovered_file(
        "jpeg",
        data,
    )

    assert result["is_valid"] is True
    assert result["has_valid_header"] is True
    assert result["has_valid_footer"] is True


def test_validate_partial_jpeg():
    data = (
        b"\xFF\xD8\xFF"
        + b"INCOMPLETE JPEG"
    )

    result = validate_recovered_file(
        "jpeg",
        data,
    )

    assert result["is_valid"] is False
    assert result["has_valid_header"] is True
    assert result["has_valid_footer"] is False


def test_validate_empty_file():
    result = validate_recovered_file(
        "jpeg",
        b"",
    )

    assert result["is_valid"] is False


def test_validate_unsupported_file_type():
    result = validate_recovered_file(
        "zip",
        b"some data",
    )

    assert result["is_valid"] is False


def test_build_integrity_report():
    data = (
        b"\xFF\xD8\xFF"
        + b"JPEG DATA"
        + b"\xFF\xD9"
    )

    report = build_integrity_report(
        "jpeg",
        data,
    )

    assert len(report["sha256"]) == 64
    assert report["is_valid"] is True