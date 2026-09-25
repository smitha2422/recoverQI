"""
File carving engine for RecoverIQ.

Searches raw binary data for known file signatures and
extracts both complete and partial file candidates.
"""

from .signatures import FILE_SIGNATURES


def carve_files(data: bytes) -> list[dict]:
    """
    Search binary data for known file signatures.

    The carver supports:

    1. Complete files:
       Header + Footer found.

    2. Partial files:
       Header found but footer is missing.

    Partial candidates are useful for the later
    reconstruction stage.
    """

    recovered_files = []

    for file_type, signature in FILE_SIGNATURES.items():

        header = signature["header"]
        footer = signature["footer"]

        search_position = 0

        while True:

            start = data.find(
                header,
                search_position,
            )

            if start == -1:
                break

            # Try to find the corresponding footer.
            end_position = data.find(
                footer,
                start + len(header),
            )

            if end_position != -1:

                end = end_position + len(footer)

                file_data = data[start:end]

                recovered_files.append({
                    "file_type": file_type,
                    "start_offset": start,
                    "end_offset": end,
                    "size": len(file_data),
                    "data": file_data,
                    "is_complete": True,
                })

                search_position = end

            else:
                # Footer was not found.
                #
                # Treat the remaining data as a
                # partial recovery candidate.
                file_data = data[start:]

                recovered_files.append({
                    "file_type": file_type,
                    "start_offset": start,
                    "end_offset": len(data),
                    "size": len(file_data),
                    "data": file_data,
                    "is_complete": False,
                })

                # No more occurrences of this header
                # can be safely processed after this
                # partial candidate.
                break

    recovered_files.sort(
        key=lambda item: item["start_offset"]
    )

    return recovered_files