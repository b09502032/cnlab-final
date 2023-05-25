from typing import Annotated

import sqlalchemy.orm

import trumbeak.orm


class User(trumbeak.orm.Base):
    __tablename__ = "user"

    id: sqlalchemy.orm.Mapped[
        Annotated[int, sqlalchemy.orm.mapped_column(primary_key=True)]
    ] = sqlalchemy.orm.mapped_column(init=False)
    name: sqlalchemy.orm.Mapped[
        Annotated[str, sqlalchemy.orm.mapped_column(unique=True)]
    ]
