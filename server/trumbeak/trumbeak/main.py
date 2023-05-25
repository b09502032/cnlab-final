import asyncio

import argon2
import fastapi
import uvicorn

import trumbeak.app
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

    session_manager = trumbeak.session.Manager({})
    user_manager = trumbeak.users.manager.Manager(
        session_maker=session_maker, password_hasher=argon2.PasswordHasher()
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
                session_maker=session_maker, spaces={}
            ),
        ),
    )

    config = uvicorn.Config(app)
    server = uvicorn.Server(config)
    await server.serve()


if __name__ == "__main__":
    asyncio.run(main())
