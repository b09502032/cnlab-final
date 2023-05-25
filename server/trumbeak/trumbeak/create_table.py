import asyncio

import sqlalchemy.ext.asyncio

import trumbeak.default
import trumbeak.orm
import trumbeak.password.models
import trumbeak.reversi.models
import trumbeak.users.models


async def create(engine: sqlalchemy.ext.asyncio.AsyncEngine):
    async with engine.begin() as connection:
        await trumbeak.orm.create(connection, trumbeak.users.models.User)
        await trumbeak.orm.create(connection, trumbeak.password.models.Password)
        await trumbeak.orm.create(connection, trumbeak.reversi.models.Reversi)


async def main():
    engine = trumbeak.default.default_engine()
    await create(engine)


if __name__ == "__main__":
    asyncio.run(main())
