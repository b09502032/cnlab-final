import dataclasses
import time
from typing import Annotated

import fastapi
import starlette.websockets

import trumbeak.reversi.manager
import trumbeak.session
import trumbeak.users.manager

SESSION_TIMEOUT = 86400


@dataclasses.dataclass
class Main:
    session_manager: trumbeak.session.Manager
    user_manager: trumbeak.users.manager.Manager

    def set_session(self, response: fastapi.Response, session_id: str):
        response.set_cookie("session", value=session_id, max_age=SESSION_TIMEOUT)

    def delete_session(self, response: fastapi.Response):
        response.set_cookie("session", max_age=0)

    async def login(self, response: fastapi.Response, username: str, password: str):
        user_id = await self.user_manager.verify_password(username, password)
        session_id = self.session_manager.add_session_info(
            trumbeak.session.SessionInfo(
                user_id=user_id, expire=time.time() + SESSION_TIMEOUT
            )
        )
        self.set_session(response, session_id)

    async def logout(
        self, response: fastapi.Response, session: Annotated[str, fastapi.Cookie()]
    ):
        del self.session_manager.sessions[session]
        self.delete_session(response)


@dataclasses.dataclass
class Reversi:
    session_manager: trumbeak.session.Manager
    reversi_manager: trumbeak.reversi.manager.Manager

    def create_reversi(self, session: Annotated[str, fastapi.Cookie()]):
        user_id = self.session_manager.get_user_id(session)
        assert user_id is not None
        return self.reversi_manager.create_reversi(user_id)

    async def enter_reversi(
        self,
        socket: starlette.websockets.WebSocket,
        session: Annotated[str, fastapi.Cookie()],
        id: int,
    ):
        user_id = self.session_manager.get_user_id(session)
        await self.reversi_manager.enter_reversi(socket, id, user_id)


def reversi_router(router: fastapi.APIRouter, reversi: Reversi):
    router.post("/")(reversi.create_reversi)
    router.websocket("/ws/{id}")(reversi.enter_reversi)
    return router


def main_router(router: fastapi.APIRouter, main: Main):
    router.post("/users")(main.user_manager.create_user)
    router.post("/login")(main.login)
    router.post("/logout")(main.logout)
    return router


def build_app(app: fastapi.FastAPI, main: Main, reversi: Reversi):
    api_router = main_router(fastapi.APIRouter(prefix="/api"), main)
    api_router.include_router(
        reversi_router(fastapi.APIRouter(prefix="/reversi"), reversi)
    )
    app.include_router(api_router)
