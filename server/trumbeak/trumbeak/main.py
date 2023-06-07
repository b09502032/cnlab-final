import asyncio
import pathlib

import argon2
import fastapi
import requests
import uvicorn

import trumbeak.app
import trumbeak.bad
import trumbeak.create_table
import trumbeak.default
import trumbeak.orm
import trumbeak.reversi.manager
import trumbeak.session
import trumbeak.users.manager


async def main():
    engine = trumbeak.default.default_engine()
    session_maker = trumbeak.orm.create_session_maker(engine)

    await trumbeak.create_table.create(engine)

    http_session = requests.Session()
    response = http_session.post(
        trumbeak.bad.URL + "api/login", json={"username": "admin", "password": "admin"}
    )
    response.raise_for_status()
    assert response.json() is True

    session_manager = trumbeak.session.Manager({})
    user_manager = trumbeak.users.manager.Manager(
        session_maker=session_maker,
        password_hasher=argon2.PasswordHasher(),
        http_session=http_session,
    )
    app = fastapi.FastAPI()
    trumbeak.app.build_app(
        app=app,
        main=trumbeak.app.Main(
            session_manager=session_manager, user_manager=user_manager
        ),
        reversi=trumbeak.app.Reversi(
            session_manager=session_manager,
            reversi_manager=trumbeak.reversi.manager.Manager(
                session_maker=session_maker, spaces={}, user_manager=user_manager
            ),
        ),
        directory=pathlib.Path("../../client/dunsparce/dist"),
    )

    config = uvicorn.Config(app, host="0.0.0.0")
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    asyncio.run(main())
