import sqlalchemy.engine
import sqlalchemy.ext.asyncio
import sqlalchemy.orm
import sqlalchemy.schema


class Base(sqlalchemy.orm.MappedAsDataclass, sqlalchemy.orm.DeclarativeBase):
    pass


def create_engine(url: sqlalchemy.engine.URL):
    return sqlalchemy.ext.asyncio.create_async_engine(url, echo=True)


def create_session_maker(engine: sqlalchemy.ext.asyncio.AsyncEngine):
    return sqlalchemy.ext.asyncio.async_sessionmaker(
        engine, autoflush=False, expire_on_commit=False
    )


def get_table(declarative_class: sqlalchemy.orm.DeclarativeBase):
    table = declarative_class.__table__
    assert isinstance(table, sqlalchemy.schema.Table)
    return table


def create(
    connection: sqlalchemy.ext.asyncio.AsyncConnection,
    declarative_class: sqlalchemy.orm.DeclarativeBase,
):
    table = get_table(declarative_class)
    return connection.run_sync(table.create)


async def execute_cursor_result(
    session: sqlalchemy.ext.asyncio.AsyncSession, statement: sqlalchemy.Update
):
    result = await session.execute(statement)
    assert isinstance(result, sqlalchemy.engine.CursorResult)
    return result


async def execute_check_row_count(
    session: sqlalchemy.ext.asyncio.AsyncSession, statement: sqlalchemy.Update
):
    result = await execute_cursor_result(session, statement)
    assert result.rowcount > 0
    return result
