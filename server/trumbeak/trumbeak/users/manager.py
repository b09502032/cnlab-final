import dataclasses
import string

import argon2
import sqlalchemy.ext.asyncio

import trumbeak.password.crud
import trumbeak.users.crud

USERNAME_CHARACTERS = string.ascii_lowercase + string.digits


@dataclasses.dataclass
class Manager:
    session_maker: sqlalchemy.ext.asyncio.async_sessionmaker[
        sqlalchemy.ext.asyncio.AsyncSession
    ]
    password_hasher: argon2.PasswordHasher

    async def create_user(self, username: str, password: str):
        assert all(c in USERNAME_CHARACTERS for c in username)
        password_hash = self.password_hasher.hash(password)
        async with self.session_maker() as session:
            await trumbeak.users.crud.create_user(session, username, password_hash)
            await session.commit()

    async def verify_password(self, username: str, password: str):
        async with self.session_maker() as session:
            user_id = (await trumbeak.users.crud.get_user_by_name(session, username)).id
            password_hash = (
                await trumbeak.password.crud.get_password(session, user_id)
            ).hash
            self.password_hasher.verify(password_hash, password)
            if self.password_hasher.check_needs_rehash(password_hash):
                await trumbeak.password.crud.update_password(session, user_id, hash)
                await session.commit()
            return user_id

    async def get_user(self, id: int):
        async with self.session_maker() as session:
            return await trumbeak.users.crud.get_user(session, id)
