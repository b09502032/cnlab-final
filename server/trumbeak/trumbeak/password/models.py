from typing import Annotated

import sqlalchemy.orm
import sqlalchemy.schema

import trumbeak.orm
import trumbeak.users.models


class Password(trumbeak.orm.Base):
    __tablename__ = "password"

    user_id: sqlalchemy.orm.Mapped[
        Annotated[
            int,
            sqlalchemy.orm.mapped_column(
                sqlalchemy.schema.ForeignKey(trumbeak.users.models.User.id),
                primary_key=True,
            ),
        ]
    ]
    hash: sqlalchemy.orm.Mapped[str]
