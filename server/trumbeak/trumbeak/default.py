import sqlalchemy.engine

import trumbeak.orm


def default_url():
    return sqlalchemy.engine.URL.create("sqlite+aiosqlite")


def default_engine():
    return trumbeak.orm.create_engine(default_url())
