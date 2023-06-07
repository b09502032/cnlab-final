import datetime
from typing import Annotated

import sqlalchemy
import sqlalchemy.engine
import sqlalchemy.orm


class Base(sqlalchemy.orm.MappedAsDataclass, sqlalchemy.orm.DeclarativeBase):
    pass


class radusergroup(Base):
    __tablename__ = "radusergroup"

    id: sqlalchemy.orm.Mapped[
        Annotated[int, sqlalchemy.orm.mapped_column(primary_key=True)]
    ] = sqlalchemy.orm.mapped_column(init=False)
    username: sqlalchemy.orm.Mapped[str]
    groupname: sqlalchemy.orm.Mapped[str]
    # priority: sqlalchemy.orm.Mapped[int]


class radcheck(Base):
    __tablename__ = "radcheck"

    id: sqlalchemy.orm.Mapped[
        Annotated[int, sqlalchemy.orm.mapped_column(primary_key=True)]
    ] = sqlalchemy.orm.mapped_column(init=False)
    username: sqlalchemy.orm.Mapped[str]
    attribute: sqlalchemy.orm.Mapped[str]
    op: sqlalchemy.orm.Mapped[str]
    value: sqlalchemy.orm.Mapped[str]


class radacct(Base):
    __tablename__ = "radacct"

    radacctid: sqlalchemy.orm.Mapped[
        Annotated[int, sqlalchemy.orm.mapped_column(primary_key=True)]
    ] = sqlalchemy.orm.mapped_column(init=False)
    acctsessionid: sqlalchemy.orm.Mapped[str]
    acctuniqueid: sqlalchemy.orm.Mapped[str]
    username: sqlalchemy.orm.Mapped[str]
    nasipaddress: sqlalchemy.orm.Mapped[str]
    acctstarttime: sqlalchemy.orm.Mapped[datetime.datetime | None]
    acctupdatetime: sqlalchemy.orm.Mapped[datetime.datetime | None]
    acctstoptime: sqlalchemy.orm.Mapped[datetime.datetime | None]
    acctsessiontime: sqlalchemy.orm.Mapped[int | None]
    acctinputoctets: sqlalchemy.orm.Mapped[int | None]
    acctoutputoctets: sqlalchemy.orm.Mapped[int | None]
    acctterminatecause: sqlalchemy.orm.Mapped[str]
