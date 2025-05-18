import pytest

from centralserver.internals import db_handler


@pytest.mark.asyncio
async def test_db_repopulation() -> None:
    """Check the behavior of populate_db() when database is already populated."""

    # The database should be populated already
    assert await db_handler.populate_db() is True
    assert await db_handler.populate_db() is False
