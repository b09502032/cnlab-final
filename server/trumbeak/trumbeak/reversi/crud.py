import sqlalchemy
import sqlalchemy.ext.asyncio

import trumbeak.orm
import trumbeak.reversi.core
import trumbeak.reversi.models


async def create_reversi(session: sqlalchemy.ext.asyncio.AsyncSession, owner: int):
    reversi = trumbeak.reversi.models.Reversi(
        owner=owner, players=(None, None), state=trumbeak.reversi.core.default_state()
    )
    session.add(reversi)
    await session.flush()
    return reversi


async def get_reversi(session: sqlalchemy.ext.asyncio.AsyncSession, id: int):
    statement = sqlalchemy.select(trumbeak.reversi.models.Reversi).where(
        trumbeak.reversi.models.Reversi.id == id
    )
    result = await session.scalar(statement)
    assert result is not None
    return result


async def update_player(
    session: sqlalchemy.ext.asyncio.AsyncSession,
    id: int,
    players: tuple[int | None, int | None],
):
    statement = (
        sqlalchemy.update(trumbeak.reversi.models.Reversi)
        .where(trumbeak.reversi.models.Reversi.id == id)
        .values({trumbeak.reversi.models.Reversi.players: players})
    )
    await trumbeak.orm.execute_check_row_count(session, statement)


async def update_state(
    session: sqlalchemy.ext.asyncio.AsyncSession,
    id: int,
    state: trumbeak.reversi.core.State,
):
    statement = (
        sqlalchemy.update(trumbeak.reversi.models.Reversi)
        .where(trumbeak.reversi.models.Reversi.id == id)
        .values({trumbeak.reversi.models.Reversi.state: state})
    )
    await trumbeak.orm.execute_check_row_count(session, statement)
