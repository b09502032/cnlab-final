import dataclasses
import string

import argon2
import requests
import sqlalchemy.ext.asyncio

import trumbeak.bad
import trumbeak.password.crud
import trumbeak.users.crud

USERNAME_CHARACTERS = string.ascii_lowercase + string.digits


@dataclasses.dataclass
class Manager:
    session_maker: sqlalchemy.ext.asyncio.async_sessionmaker[
        sqlalchemy.ext.asyncio.AsyncSession
    ]
    password_hasher: argon2.PasswordHasher
    http_session: requests.Session

    async def create_user(self, username: str, password: str):
        assert username
        assert password
        assert all(c in USERNAME_CHARACTERS for c in username)
        password_hash = self.password_hasher.hash(password)
        async with self.session_maker() as session:
            await trumbeak.users.crud.create_user(session, username, password_hash)
            await session.commit()
        response = self.http_session.post(
            trumbeak.bad.URL + "api/users",
            json={"username": username, "password": password},
        )
        response.raise_for_status()
        assert response.json() is None

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

    async def get_octet(self, user_id: int):
        async with self.session_maker() as session:
            user = await trumbeak.users.crud.get_user(session, user_id)
            response = self.http_session.get(
                trumbeak.bad.URL + f"api/user_info?username={user.name}"
            )
            response.raise_for_status()
            data = response.json()
            assert isinstance(data, dict)
            octet = data["max_all_session"]
            assert isinstance(octet, int)
            return octet

    async def add_octet(self, user_id: int, count: int):
        async with self.session_maker() as session:
            user = await trumbeak.users.crud.get_user(session, user_id)
            response = self.http_session.post(
                trumbeak.bad.URL + "api/add_octet",
                json={"username": user.name, "count": count},
            )
            response.raise_for_status()
            assert response.json() is None
