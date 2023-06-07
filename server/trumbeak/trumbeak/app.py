import dataclasses
import pathlib
import time
import traceback
from typing import Annotated

import fastapi
import fastapi.responses
import fastapi.staticfiles
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

    async def create_user(
        self,
        username: Annotated[str, fastapi.Body(embed=True)],
        password: Annotated[str, fastapi.Body(embed=True)],
    ):
        assert username != "admin"
        await self.user_manager.create_user(username, password)

    async def login(
        self,
        response: fastapi.Response,
        username: Annotated[str, fastapi.Body(embed=True)],
        password: Annotated[str, fastapi.Body(embed=True)],
    ):
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

    async def is_logged_in(
        self, session: Annotated[str | None, fastapi.Cookie()] = None
    ):
        if session is None:
            return False
        return self.session_manager.get_user_id(session) is not None

    async def current_user(
        self, session: Annotated[str | None, fastapi.Cookie()] = None
    ):
        if session is None:
            return None
        return self.session_manager.get_user_id(session)

    async def get_username(self, id: int):
        user = await self.user_manager.get_user(id)
        return user.name

    async def get_octet(self, session: Annotated[str, fastapi.Cookie()]):
        user_id = self.session_manager.get_user_id(session)
        assert user_id is not None
        return await self.user_manager.get_octet(user_id)


@dataclasses.dataclass
class Reversi:
    session_manager: trumbeak.session.Manager
    reversi_manager: trumbeak.reversi.manager.Manager

    async def create_reversi(self, session: Annotated[str, fastapi.Cookie()]):
        user_id = self.session_manager.get_user_id(session)
        assert user_id is not None
        return await self.reversi_manager.create_reversi(user_id)

    async def enter_reversi(
        self,
        socket: starlette.websockets.WebSocket,
        session: Annotated[str, fastapi.Cookie()],
        id: int,
    ):
        user_id = self.session_manager.get_user_id(session)
        await self.reversi_manager.enter_reversi(socket, id, user_id)


def build_reversi_router(router: fastapi.APIRouter, reversi: Reversi):
    router.get("")(reversi.reversi_manager.list_reversi)
    router.post("")(reversi.create_reversi)
    router.websocket("/ws/{id}")(reversi.enter_reversi)
    return router


def build_main_router(router: fastapi.APIRouter, main: Main):
    router.post("/users")(main.create_user)
    router.get("/users/username/{id}")(main.get_username)
    router.post("/login")(main.login)
    router.post("/logout")(main.logout)
    router.get("/is_logged_in")(main.is_logged_in)
    router.get("/current_user")(main.current_user)
    router.get("/octet")(main.get_octet)
    return router


@dataclasses.dataclass
class Dist:
    static_files: fastapi.staticfiles.StaticFiles

    async def not_found(
        self, request: fastapi.Request, exception: starlette.exceptions.HTTPException
    ):
        print(request)
        traceback.print_exception(exception)
        return await self.static_files.get_response(".", request.scope)


def build_app(
    app: fastapi.FastAPI, main: Main, reversi: Reversi, directory: pathlib.Path
):
    main_router = build_main_router(fastapi.APIRouter(prefix="/api"), main)
    reversi_router = build_reversi_router(fastapi.APIRouter(prefix="/reversi"), reversi)
    main_router.include_router(reversi_router)
    app.include_router(main_router)

    static_files = fastapi.staticfiles.StaticFiles(directory=directory, html=True)
    app.mount("/", static_files)
