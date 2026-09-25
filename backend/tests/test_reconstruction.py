from app.core.fragments import Fragment
from app.core.reconstruction import (
    order_fragments,
    find_best_fragment_chain,
    reconstruct_file,
    reconstruction_score,
    reconstruct_by_file_type,
)


def create_fragment(
    fragment_id,
    file_type,
    start,
    end,
    data,
):
    return Fragment(
        fragment_id=fragment_id,
        file_type=file_type,
        start_offset=start,
        end_offset=end,
        size=len(data),
        data=data,
    )


def test_order_fragments():
    first = create_fragment(
        1,
        "jpeg",
        0,
        5,
        b"AAAAA",
    )

    second = create_fragment(
        2,
        "jpeg",
        10,
        15,
        b"BBBBB",
    )

    fragments = [
        second,
        first,
    ]

    ordered = order_fragments(
        fragments
    )

    assert ordered == [
        first,
        second,
    ]


def test_reconstruct_file():
    first = create_fragment(
        1,
        "jpeg",
        0,
        5,
        b"AAAAA",
    )

    second = create_fragment(
        2,
        "jpeg",
        5,
        10,
        b"BBBBB",
    )

    result = reconstruct_file(
        [
            second,
            first,
        ]
    )

    assert result == b"AAAAABBBBB"


def test_reconstruct_mixed_file_types_raises():
    jpeg = create_fragment(
        1,
        "jpeg",
        0,
        5,
        b"JPEG",
    )

    pdf = create_fragment(
        2,
        "pdf",
        5,
        10,
        b"PDF",
    )

    try:
        reconstruct_file(
            [
                jpeg,
                pdf,
            ]
        )
        assert False
    except ValueError:
        assert True


def test_reconstruction_score():
    first = create_fragment(
        1,
        "jpeg",
        0,
        5,
        b"AAAAA",
    )

    second = create_fragment(
        2,
        "jpeg",
        5,
        10,
        b"BBBBB",
    )

    score = reconstruction_score(
        [
            first,
            second,
        ]
    )

    assert score == 1.0


def test_reconstruct_by_file_type():
    jpeg = create_fragment(
        1,
        "jpeg",
        0,
        5,
        b"JPEG",
    )

    pdf = create_fragment(
        2,
        "pdf",
        10,
        15,
        b"PDF",
    )

    results = reconstruct_by_file_type(
        [
            jpeg,
            pdf,
        ]
    )

    assert "jpeg" in results
    assert "pdf" in results

    assert results["jpeg"]["data"] == b"JPEG"
    assert results["pdf"]["data"] == b"PDF"


def test_find_best_fragment_chain():
    first = create_fragment(
        1,
        "jpeg",
        0,
        5,
        b"AAAAA",
    )

    second = create_fragment(
        2,
        "jpeg",
        5,
        10,
        b"BBBBB",
    )

    third = create_fragment(
        3,
        "jpeg",
        10,
        15,
        b"CCCCC",
    )

    chain = find_best_fragment_chain(
        [
            third,
            first,
            second,
        ]
    )

    assert [fragment.fragment_id for fragment in chain] == [
        1,
        2,
        3,
    ]


def test_best_chain_ignores_different_file_type():
    jpeg_first = create_fragment(
        1,
        "jpeg",
        0,
        5,
        b"JPEG1",
    )

    jpeg_second = create_fragment(
        2,
        "jpeg",
        5,
        10,
        b"JPEG2",
    )

    pdf = create_fragment(
        3,
        "pdf",
        10,
        15,
        b"PDF",
    )

    chain = find_best_fragment_chain(
        [
            jpeg_first,
            jpeg_second,
            pdf,
        ]
    )

    assert [fragment.fragment_id for fragment in chain] == [
        1,
        2,
    ]