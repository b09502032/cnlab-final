from typing import Annotated

import sqlalchemy.orm
import sqlalchemy.types

import trumbeak.orm
import trumbeak.reversi.core


class Reversi(trumbeak.orm.Base):
    __tablename__ = "reversi"

    id: sqlalchemy.orm.Mapped[
        Annotated[int, sqlalchemy.orm.mapped_column(primary_key=True)]
    ] = sqlalchemy.orm.mapped_column(init=False)
    owner: sqlalchemy.orm.Mapped[int]
    players: sqlalchemy.orm.Mapped[
        Annotated[
            tuple[int | None, int | None],
            sqlalchemy.orm.mapped_column(sqlalchemy.types.PickleType),
        ]
    ]
    state: sqlalchemy.orm.Mapped[
        Annotated[
            trumbeak.reversi.core.State,
            sqlalchemy.orm.mapped_column(sqlalchemy.types.PickleType),
        ]
    ]
