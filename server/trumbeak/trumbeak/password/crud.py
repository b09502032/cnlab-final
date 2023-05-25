import sqlalchemy.ext.asyncio

import trumbeak.orm
import trumbeak.password.models


async def get_password(session: sqlalchemy.ext.asyncio.AsyncSession, user_id: int):
    statement = sqlalchemy.select(trumbeak.password.models.Password).where(
        trumbeak.password.models.Password.user_id == user_id
    )
    result = await session.scalar(statement)
    assert result is not None
    return result


async def update_password(
    session: sqlalchemy.ext.asyncio.AsyncSession, user_id: int, hash: str
):
    statement = (
        sqlalchemy.update(trumbeak.password.models.Password)
        .where(trumbeak.password.models.Password.user_id == user_id)
        .values({trumbeak.password.models.Password.hash: hash})
    )
    await trumbeak.orm.execute_check_row_count(session, statement)
