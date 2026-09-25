"""
Fragment compatibility logic for RecoverIQ.

Determines whether fragments can potentially belong
to the same recovered file and builds a compatibility graph.
"""

from .fragments import Fragment


def are_compatible(
    first: Fragment,
    second: Fragment,
) -> bool:
    """
    Determine whether two fragments can potentially
    belong to the same recovered file.

    Rules:
    1. Same file type.
    2. No overlap.
    3. Second fragment occurs after first.
    """

    if first.file_type != second.file_type:
        return False

    if first.end_offset > second.start_offset:
        return False

    if second.start_offset <= first.start_offset:
        return False

    return True


def calculate_compatibility_score(
    first: Fragment,
    second: Fragment,
) -> float:
    """
    Calculate compatibility between two fragments.

    Returns a value between 0.0 and 1.0.
    """

    if not are_compatible(first, second):
        return 0.0

    distance = second.start_offset - first.end_offset

    if distance == 0:
        return 1.0

    if distance <= 1024:
        return 0.9

    if distance <= 4096:
        return 0.7

    if distance <= 16384:
        return 0.5

    return 0.2


def build_compatibility_graph(
    fragments: list[Fragment],
) -> dict[int, list[dict]]:
    """
    Build a directed compatibility graph.

    Each fragment becomes a node.

    An edge from fragment A to fragment B means:
        A can potentially be followed by B.

    Example:

        {
            1: [
                {
                    "fragment_id": 2,
                    "score": 0.9
                }
            ]
        }
    """

    graph: dict[int, list[dict]] = {
        fragment.fragment_id: []
        for fragment in fragments
    }

    for first in fragments:

        for second in fragments:

            if first.fragment_id == second.fragment_id:
                continue

            if not are_compatible(first, second):
                continue

            score = calculate_compatibility_score(
                first,
                second,
            )

            graph[first.fragment_id].append({
                "fragment_id": second.fragment_id,
                "score": score,
            })

        # Highest compatibility first.
        graph[first.fragment_id].sort(
            key=lambda edge: edge["score"],
            reverse=True,
        )

    return graph