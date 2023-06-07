import dataclasses

import sqlalchemy
import sqlalchemy.engine
import sqlalchemy.orm

import lampent.crud
import lampent.schemas


def create_engine(url: sqlalchemy.engine.URL):
    return sqlalchemy.create_engine(url, echo=True)


def create_session_maker(engine: sqlalchemy.engine.Engine):
    return sqlalchemy.orm.sessionmaker(engine, autoflush=False)


@dataclasses.dataclass
class Lickitung:
    session_maker: sqlalchemy.orm.sessionmaker[sqlalchemy.orm.Session]

    def create_user(self, user: lampent.schemas.User):
        with self.session_maker() as session:
            lampent.crud.create_user(session, user)

    def check_user_password(self, user: lampent.schemas.User):
        with self.session_maker() as session:
            return lampent.crud.check_user_password(session, user)

    def get_accounting(self, username: str | None):
        with self.session_maker() as session:
            yield from lampent.crud.get_accounting(session, username)

    def list_users(self):
        with self.session_maker() as session:
            yield from lampent.crud.list_users(session)

    def get_user_info(self, username: str):
        with self.session_maker() as session:
            return lampent.crud.get_user_info(session, username)

    def set_user_info(self, user_info: lampent.schemas.UserInfoUpdate):
        with self.session_maker() as session:
            return lampent.crud.set_user_info(session, user_info)

    def get_user_password(self, username: str):
        with self.session_maker() as session:
            return lampent.crud.get_user_password(session, username)

    def modify_max_octet(self, username: str, octet: int):
        with self.session_maker() as session:
            lampent.crud.modify_max_octet(session, username, octet)
