import sqlalchemy
import sqlalchemy.orm

import lampent.models
import lampent.schemas


def check_user_password(session: sqlalchemy.orm.Session, user: lampent.schemas.User):
    statement = sqlalchemy.select(lampent.models.radcheck).where(
        (lampent.models.radcheck.username == user.username)
        & (lampent.models.radcheck.attribute == "Cleartext-Password")
        & (lampent.models.radcheck.op == ":=")
        & (lampent.models.radcheck.value == user.password)
    )
    return session.scalar(statement) is not None


def get_user_password(session: sqlalchemy.orm.Session, username: str):
    statement = sqlalchemy.select(lampent.models.radcheck).where(
        (lampent.models.radcheck.username == username)
        & (lampent.models.radcheck.attribute == "Cleartext-Password")
        & (lampent.models.radcheck.op == ":=")
    )
    result = session.scalar(statement)
    assert result is not None
    return result.value


def create_user(session: sqlalchemy.orm.Session, user: lampent.schemas.User):
    statement = sqlalchemy.delete(lampent.models.radcheck).where(
        lampent.models.radcheck.username == user.username
    )
    session.execute(statement)
    statement = sqlalchemy.delete(lampent.models.radusergroup).where(
        lampent.models.radusergroup.username == user.username
    )
    session.execute(statement)
    statement = sqlalchemy.delete(lampent.models.radacct).where(
        lampent.models.radacct.username == user.username
    )
    session.execute(statement)
    statement = sqlalchemy.select(lampent.models.radcheck).where(
        lampent.models.radcheck.username == user.username
    )
    assert session.scalar(statement) is None
    session.add(
        lampent.models.radcheck(
            user.username, "Cleartext-Password", ":=", user.password
        )
    )
    session.add(lampent.models.radusergroup(user.username, "user"))
    session.commit()
    set_user_info(session, lampent.schemas.UserInfoUpdate(user.username, "", "0"))


def list_users(session: sqlalchemy.orm.Session):
    statement = sqlalchemy.select(lampent.models.radcheck.username).distinct()
    for row in session.execute(statement).tuples():
        yield row[0]


def get_accounting(session: sqlalchemy.orm.Session, username: str | None):
    statement = sqlalchemy.select(lampent.models.radacct)
    if username is not None:
        statement = statement.where(lampent.models.radacct.username == username)
    yield from session.scalars(statement)


def str_to_int_maybe_none(o: str | None):
    if o is None:
        return None
    return int(o)


def none_to_zero(o: int | None):
    if o is None:
        return 0
    return o


def get_user_info(session: sqlalchemy.orm.Session, username: str):
    result = list(
        session.scalars(
            sqlalchemy.select(lampent.models.radacct).where(
                lampent.models.radacct.username == username
            )
        )
    )
    return lampent.schemas.UserInfo(
        username=username,
        all_session=sum(none_to_zero(item.acctsessiontime) for item in result),
        all_total_octets=sum(
            none_to_zero(item.acctinputoctets) + none_to_zero(item.acctoutputoctets)
            for item in result
        ),
        max_all_session=str_to_int_maybe_none(
            session.scalar(
                sqlalchemy.select(lampent.models.radcheck.value).where(
                    (lampent.models.radcheck.username == username)
                    & (lampent.models.radcheck.attribute == "Max-All-Session")
                    & (lampent.models.radcheck.op == ":=")
                )
            )
        ),
        max_all_total_octets=str_to_int_maybe_none(
            session.scalar(
                sqlalchemy.select(lampent.models.radcheck.value).where(
                    (lampent.models.radcheck.username == username)
                    & (lampent.models.radcheck.attribute == "Max-All-Total-Octets")
                    & (lampent.models.radcheck.op == ":=")
                )
            )
        ),
    )


def modify_max_octet(session: sqlalchemy.orm.Session, username: str, octet: int):
    statement = sqlalchemy.select(lampent.models.radcheck).where(
        (lampent.models.radcheck.username == username)
        & (lampent.models.radcheck.attribute == "Max-All-Total-Octets")
        & (lampent.models.radcheck.op == ":=")
    )
    result = session.scalar(statement)
    assert result is not None
    value = int(result.value)
    value += octet
    result.value = str(value)
    session.commit()


def set_user_info(
    session: sqlalchemy.orm.Session, user_info: lampent.schemas.UserInfoUpdate
):
    session.execute(
        sqlalchemy.delete(lampent.models.radcheck).where(
            (lampent.models.radcheck.username == user_info.username)
            & (
                (lampent.models.radcheck.attribute == "Max-All-Session")
                | (lampent.models.radcheck.attribute == "Max-All-Total-Octets")
            )
            & (lampent.models.radcheck.op == ":=")
        )
    )
    if user_info.max_all_session != "":
        max_all_session = int(user_info.max_all_session)
        session.add(
            lampent.models.radcheck(
                user_info.username, "Max-All-Session", ":=", str(max_all_session)
            )
        )
    if user_info.max_all_total_octets != "":
        max_all_total_octets = int(user_info.max_all_total_octets)
        session.add(
            lampent.models.radcheck(
                user_info.username,
                "Max-All-Total-Octets",
                ":=",
                str(max_all_total_octets),
            )
        )
    session.commit()
