"""
Fragment reconstruction engine for RecoverIQ.

Builds compatibility-based fragment chains and
reconstructs recovered files from those chains.
"""

from .fragments import Fragment
from .compatibility import (
    are_compatible,
    calculate_compatibility_score,
    build_compatibility_graph,
)


def order_fragments(
    fragments: list[Fragment],
) -> list[Fragment]:
    """
    Order fragments according to their position
    in the original binary data.
    """

    return sorted(
        fragments,
        key=lambda fragment: fragment.start_offset,
    )


def find_best_fragment_chain(
    fragments: list[Fragment],
) -> list[Fragment]:
    """
    Find a high-confidence compatible chain of fragments.

    The algorithm:

    1. Orders fragments by their original position.
    2. Uses the file type of the first fragment.
    3. Builds a compatibility graph.
    4. Starts with the earliest fragment.
    5. Follows the strongest compatible connection.
    """

    if not fragments:
        return []

    ordered = order_fragments(fragments)

    file_type = ordered[0].file_type

    candidates = [
        fragment
        for fragment in ordered
        if fragment.file_type == file_type
    ]

    if not candidates:
        return []

    graph = build_compatibility_graph(
        candidates
    )

    current = candidates[0]

    chain = [current]

    used_ids = {
        current.fragment_id
    }

    while True:

        possible_edges = graph.get(
            current.fragment_id,
            [],
        )

        next_fragment = None

        for edge in possible_edges:

            fragment_id = edge["fragment_id"]

            if fragment_id in used_ids:
                continue

            candidate = next(
                (
                    fragment
                    for fragment in candidates
                    if fragment.fragment_id
                    == fragment_id
                ),
                None,
            )

            if candidate is None:
                continue

            if not are_compatible(
                current,
                candidate,
            ):
                continue

            next_fragment = candidate
            break

        if next_fragment is None:
            break

        chain.append(next_fragment)

        used_ids.add(
            next_fragment.fragment_id
        )

        current = next_fragment

    return chain


def reconstruct_file(
    fragments: list[Fragment],
) -> bytes:
    """
    Reconstruct a single file from its fragments.

    All supplied fragments must belong to
    the same file type.
    """

    if not fragments:
        return b""

    # Validate the original input before building
    # the compatibility chain.
    file_type = fragments[0].file_type

    if any(
        fragment.file_type != file_type
        for fragment in fragments
    ):
        raise ValueError(
            "All fragments must belong to the same file type."
        )

    ordered = find_best_fragment_chain(
        fragments
    )

    if not ordered:
        return b""

    reconstructed = bytearray()

    for fragment in ordered:
        reconstructed.extend(
            fragment.data
        )

    return bytes(reconstructed)


def reconstruction_score(
    fragments: list[Fragment],
) -> float:
    """
    Calculate an overall compatibility score
    for a reconstruction.

    Returns a value between 0.0 and 1.0.
    """

    if not fragments:
        return 0.0

    if len(fragments) == 1:
        return 1.0

    ordered = find_best_fragment_chain(
        fragments
    )

    if len(ordered) < 2:
        return 0.0

    scores = []

    for first, second in zip(
        ordered,
        ordered[1:],
    ):

        if not are_compatible(
            first,
            second,
        ):
            return 0.0

        score = calculate_compatibility_score(
            first,
            second,
        )

        scores.append(score)

    if not scores:
        return 0.0

    return sum(scores) / len(scores)


def reconstruct_by_file_type(
    fragments: list[Fragment],
) -> dict[str, dict]:
    """
    Group fragments by file type and reconstruct
    each file type independently.
    """

    groups: dict[str, list[Fragment]] = {}

    for fragment in fragments:

        groups.setdefault(
            fragment.file_type,
            [],
        ).append(fragment)

    results: dict[str, dict] = {}

    for file_type, group in groups.items():

        chain = find_best_fragment_chain(
            group
        )

        reconstructed = reconstruct_file(
            chain
        )

        score = reconstruction_score(
            chain
        )

        results[file_type] = {
            "data": reconstructed,
            "size": len(reconstructed),
            "confidence_score": score,
            "fragment_ids": [
                fragment.fragment_id
                for fragment in chain
            ],
        }

    return results