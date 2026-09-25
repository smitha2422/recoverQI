from app.core.storage import (
    save_recovered_file,
    get_recovered_file,
)


def test_save_recovered_file():
    data = b"TEST RECOVERED JPEG DATA"

    result = save_recovered_file(
        file_type="jpeg",
        data=data,
    )

    assert result["file_type"] == "jpeg"
    assert result["size"] == len(data)
    assert result["filename"].endswith(".jpg")

    file_path = get_recovered_file(
        result["filename"]
    )

    assert file_path is not None
    assert file_path.exists()
    assert file_path.read_bytes() == data

    # Clean up test file.
    file_path.unlink()


def test_get_recovered_file_not_found():
    result = get_recovered_file(
        "this_file_does_not_exist.jpg"
    )

    assert result is None


def test_path_traversal_is_blocked():
    result = get_recovered_file(
        "../secret.txt"
    )

    assert result is None