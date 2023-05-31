import sqlalchemy
import sqlalchemy.ext.asyncio

import trumbeak.password.models
import trumbeak.users.models


async def create_user(
    session: sqlalchemy.ext.asyncio.AsyncSession, username: str, password_hash: str
):
    user = trumbeak.users.models.User(username)
    session.add(user)
    await session.flush()
    password = trumbeak.password.models.Password(user_id=user.id, hash=password_hash)
    session.add(password)
    await session.flush()


async def get_user_by_name(session: sqlalchemy.ext.asyncio.AsyncSession, name: str):
    statement = sqlalchemy.select(trumbeak.users.models.User).where(
        trumbeak.users.models.User.name == name
    )
    result = await session.scalar(statement)
    assert result is not None
    return result


async def get_user(session: sqlalchemy.ext.asyncio.AsyncSession, id: int):
    statement = sqlalchemy.select(trumbeak.users.models.User).where(
        trumbeak.users.models.User.id == id
    )
    result = await session.scalar(statement)
    assert result is not None
    return result
