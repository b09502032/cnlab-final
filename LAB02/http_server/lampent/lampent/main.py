import secrets

import fastapi
import sqlalchemy
import sqlalchemy.engine
import uvicorn

import lampent.app
import lampent.lickitung
import lampent.models
import lampent.radclient
import lampent.schemas
import lampent.uam


def main():
    url = sqlalchemy.engine.URL.create(
        "mariadb+pymysql",
        username="http_server",
        password="N42unCmVv5C7yiH7jXaQTJ9CftmyAAfwrFuaTCt7rbav25QdSd77HmFkgskbuaQ2c2QnHNTZ5rbSRa9pkc7cxNkVVpxrmMttiDhgSa997YokAxiWhRCchivizKDKXbRK",
        database="radius",
        query={"unix_socket": "/run/mysqld/mysqld.sock"},
    )
    engine = lampent.lickitung.create_engine(url)
    session_maker = lampent.lickitung.create_session_maker(engine)

    with session_maker() as session:
        statement = sqlalchemy.delete(lampent.models.radcheck).where(
            lampent.models.radcheck.username != "admin"
        )
        session.execute(statement)
        session.commit()

    lickitung = lampent.lickitung.Lickitung(session_maker)

    # with session_maker() as session:
    #     statement = sqlalchemy.select(lampent.models.radacct)
    #     for r in session.scalars(statement):
    #         print(r)
    # return
    # lickitung.create_user(lampent.schemas.UserCreate("tata", "test"))

    auth_araquanid = lampent.radclient.create_araquanid(
        "127.0.0.1", 1812, b"testing123"
    )

    dynamic_authorization_araquanid = lampent.radclient.create_araquanid(
        "127.0.0.1", 3799, b"testing123"
    )

    unown = lampent.uam.Unown(b"ht2eb8ej6s4et3rg1ulp")

    app = fastapi.FastAPI()

    lampent.app.build_app(
        app=app,
        secret_key=secrets.token_hex(),
        directory="lampent/html/build",
        main=lampent.app.Main(
            lickitung=lickitung,
            auth_araquanid=auth_araquanid,
            dynamic_authorization_araquanid=dynamic_authorization_araquanid,
        ),
        uam=lampent.app.UAM(unown),
    )

    uvicorn.run(app, host="0.0.0.0")


if __name__ == "__main__":
    main()
