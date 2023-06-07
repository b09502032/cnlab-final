import dataclasses
import secrets
from typing import Annotated

import fastapi
import fastapi.responses
import fastapi.staticfiles
import fastapi.templating
import starlette.middleware.sessions

import lampent.lickitung
import lampent.radclient
import lampent.schemas
import lampent.uam


def assert_str(o):
    assert isinstance(o, str)
    return o


def assert_str_or_none(o):
    if o is None:
        return None
    return assert_str(o)


@dataclasses.dataclass
class UAM:
    unown: lampent.uam.Unown

    def check(
        self, request: fastapi.Request, url: Annotated[str, fastapi.Body(embed=True)]
    ):
        self.unown.check(url)
        result = self.unown.result(url)
        request.session["uam_result"] = dataclasses.asdict(result)
        return result

    def new_id(self):
        while True:
            id = secrets.token_urlsafe()
            if id not in self.result_storage:
                return id

    def login_url(
        self,
        request: fastapi.Request,
        url: Annotated[str, fastapi.Body()],
        username: Annotated[str, fastapi.Body()],
        password: Annotated[str, fastapi.Body()],
    ):
        result = self.check(request, url)
        assert isinstance(
            result, lampent.uam.NotYet | lampent.uam.Failed | lampent.uam.Logoff
        )
        return self.unown.login_url(result, username, password)

    def get_uam_result(self, request: fastapi.Request):
        session = request.session
        try:
            result = session["uam_result"]
        except KeyError:
            return None
        assert isinstance(result, dict)
        return {
            assert_str(key): assert_str_or_none(value) for key, value in result.items()
        }


def uam_router(router: fastapi.APIRouter, uam: UAM):
    router.post("/login_url")(uam.login_url)
    router.post("/check")(uam.check)
    router.get("/result")(uam.get_uam_result)
    return router


def get_session_username(request: fastapi.Request):
    session = request.session
    try:
        username = session["username"]
    except KeyError:
        return None
    assert isinstance(username, str)
    return username


@dataclasses.dataclass
class Main:
    lickitung: lampent.lickitung.Lickitung
    auth_araquanid: lampent.radclient.Araquanid
    dynamic_authorization_araquanid: lampent.radclient.Araquanid

    def login(self, request: fastapi.Request, user: lampent.schemas.User):
        ok = self.lickitung.check_user_password(user)
        if ok:
            request.session["username"] = user.username
        return ok

    def logout(self, request: fastapi.Request):
        request.session.pop("username", None)

    def accounting(
        self,
        session_username: Annotated[str | None, fastapi.Depends(get_session_username)],
        username: str | None = None,
    ):
        if session_username is None:
            raise fastapi.HTTPException(401)
        if session_username == "admin":
            result_username = username
        else:
            result_username = session_username
        return list(self.lickitung.get_accounting(result_username))

    def list_users(
        self, session_username: Annotated[str, fastapi.Depends(get_session_username)]
    ):
        if session_username != "admin":
            raise fastapi.HTTPException(401)
        return list(self.lickitung.list_users())

    def get_user_info(
        self,
        session_username: Annotated[str | None, fastapi.Depends(get_session_username)],
        username: str,
    ):
        if session_username is None:
            raise fastapi.HTTPException(401)
        if session_username == "admin":
            result_username = username
        elif session_username != username:
            raise fastapi.HTTPException(401)
        else:
            result_username = session_username
        return self.lickitung.get_user_info(result_username)

    async def set_user_info(
        self,
        session_username: Annotated[str | None, fastapi.Depends(get_session_username)],
        user_info: lampent.schemas.UserInfoUpdate,
    ):
        if session_username != "admin":
            raise fastapi.HTTPException(401)
        self.lickitung.set_user_info(user_info)

    async def add_octet(
        self,
        session_username: Annotated[str | None, fastapi.Depends(get_session_username)],
        username: Annotated[str, fastapi.Body(embed=True)],
        count: Annotated[int, fastapi.Body(embed=True)],
    ):
        if session_username != "admin":
            raise fastapi.HTTPException(401)
        self.lickitung.modify_max_octet(username, count)

    async def disconnect(
        self,
        session_username: Annotated[str | None, fastapi.Depends(get_session_username)],
        username: Annotated[str, fastapi.Body(embed=True)],
    ):
        if session_username != "admin":
            raise fastapi.HTTPException(401)
        return await self.dynamic_authorization_araquanid.disconnect(username, ())

    async def coa(
        self,
        session_username: Annotated[str | None, fastapi.Depends(get_session_username)],
        username: Annotated[str, fastapi.Body(embed=True)],
    ):
        if session_username != "admin":
            raise fastapi.HTTPException(401)
        password = self.lickitung.get_user_password(username)
        auth_result = await self.auth_araquanid.auth(username, password)
        (response,) = (
            message
            for message in auth_result[0]
            if isinstance(message, lampent.radclient.Response)
        )
        if response.name == b"Access-Reject":
            return await self.dynamic_authorization_araquanid.disconnect(
                username, response.pairs
            )
        assert response.name == b"Access-Accept"
        return await self.dynamic_authorization_araquanid.coa(username, response.pairs)


def main_router(router: fastapi.APIRouter, main: Main):
    router.post("/users")(main.lickitung.create_user)
    router.post("/login")(main.login)
    router.post("/logout")(main.logout)
    router.get("/accounting")(main.accounting)
    router.get("/users")(main.list_users)
    router.get("/current_user")(get_session_username)
    router.get("/user_info")(main.get_user_info)
    router.put("/user_info")(main.set_user_info)
    router.post("/disconnect")(main.disconnect)
    router.post("/coa")(main.coa)
    router.post("/add_octet")(main.add_octet)
    return router


def build_app(
    app: fastapi.FastAPI, secret_key: str, directory: str, main: Main, uam: UAM
):
    app.add_middleware(
        starlette.middleware.sessions.SessionMiddleware, secret_key=secret_key
    )

    app.include_router(main_router(fastapi.APIRouter(prefix="/api"), main))

    app.include_router(uam_router(fastapi.APIRouter(prefix="/api/uam"), uam))

    app.mount("/", fastapi.staticfiles.StaticFiles(directory=directory, html=True))
