import os
import sys
import unittest

sys.path.insert(
    0,
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    ),
)

from app.core.fragments import Fragment
from app.core.compatibility import (
    are_compatible,
    calculate_compatibility_score,
    build_compatibility_graph,
)


def make_fragment(fragment_id, file_type, start, end):
    """Create a test fragment with the specified offsets."""
    data = b"A" * (end - start)

    return Fragment(
        fragment_id=fragment_id,
        file_type=file_type,
        start_offset=start,
        end_offset=end,
        size=end - start,
        data=data,
    )


class TestCompatibility(unittest.TestCase):

    def test_compatible_fragments(self):
        first = make_fragment(1, "jpeg", 100, 200)
        second = make_fragment(2, "jpeg", 200, 300)

        self.assertTrue(are_compatible(first, second))

    def test_different_file_types_are_not_compatible(self):
        first = make_fragment(1, "jpeg", 100, 200)
        second = make_fragment(2, "png", 200, 300)

        self.assertFalse(are_compatible(first, second))

    def test_overlapping_fragments_are_not_compatible(self):
        first = make_fragment(1, "jpeg", 100, 250)
        second = make_fragment(2, "jpeg", 200, 300)

        self.assertFalse(are_compatible(first, second))

    def test_compatibility_score(self):
        first = make_fragment(1, "jpeg", 100, 200)
        second = make_fragment(2, "jpeg", 200, 300)

        score = calculate_compatibility_score(first, second)

        self.assertEqual(score, 1.0)


if __name__ == "__main__":
    unittest.main()