import dataclasses
import hashlib
import re
import urllib.parse
from typing import Literal

import lampent.chilli_response


@dataclasses.dataclass
class NotYet:
    result: Literal["notyet"]
    uam_ip: str
    uam_port: str
    challenge: str
    called: str
    mac: str
    ip: str
    nas_id: str
    session_id: str
    user_url: str
    md: str


@dataclasses.dataclass
class Failed:
    result: Literal["failed"]
    reason: str
    uam_ip: str
    uam_port: str
    challenge: str
    called: str
    mac: str
    ip: str
    reply: str | None
    nas_id: str
    session_id: str
    user_url: str
    md: str


@dataclasses.dataclass
class Success:
    result: Literal["success"]
    uam_ip: str
    uam_port: str
    called: str
    uid: str
    time_left: str | None
    mac: str
    ip: str
    nas_id: str
    session_id: str
    user_url: str
    md: str


@dataclasses.dataclass
class Already:
    result: Literal["already"]
    uam_ip: str
    uam_port: str
    called: str
    mac: str
    ip: str
    nas_id: str
    session_id: str
    user_url: str
    md: str


@dataclasses.dataclass
class Logoff:
    result: Literal["logoff"]
    uam_ip: str
    uam_port: str
    challenge: str
    called: str
    mac: str
    ip: str
    nas_id: str
    session_id: str
    user_url: str
    md: str


Result = NotYet | Failed | Success | Already | Logoff


def query_get(query: dict[str, list[str]], name: str):
    (value,) = query[name]
    return value


def query_get_or_none(query: dict[str, list[str]], name: str):
    try:
        values = query[name]
    except KeyError:
        return None
    (value,) = values
    return value


def query_to_not_yet(query: dict[str, list[str]]):
    assert query.keys() == {
        "res",
        "uamip",
        "uamport",
        "challenge",
        "called",
        "mac",
        "ip",
        "nasid",
        "sessionid",
        "userurl",
        "md",
    }

    def get(name: str):
        return query_get(query, name)

    assert get("res") == "notyet"

    return NotYet(
        result="notyet",
        uam_ip=get("uamip"),
        uam_port=get("uamport"),
        challenge=get("challenge"),
        called=get("called"),
        mac=get("mac"),
        ip=get("ip"),
        nas_id=get("nasid"),
        session_id=get("sessionid"),
        user_url=get("userurl"),
        md=get("md"),
    )


def query_to_failed(query: dict[str, list[str]]):
    assert (
        {
            "res",
            "reason",
            "uamip",
            "uamport",
            "challenge",
            "called",
            "mac",
            "ip",
            "nasid",
            "sessionid",
            "userurl",
            "md",
        }
        <= query.keys()
        <= {
            "res",
            "reason",
            "uamip",
            "uamport",
            "challenge",
            "called",
            "mac",
            "ip",
            "reply",
            "nasid",
            "sessionid",
            "userurl",
            "md",
        }
    )

    def get(name: str):
        return query_get(query, name)

    assert get("res") == "failed"

    return Failed(
        result="failed",
        reason=get("reason"),
        uam_ip=get("uamip"),
        uam_port=get("uamport"),
        challenge=get("challenge"),
        called=get("called"),
        mac=get("mac"),
        ip=get("ip"),
        reply=query_get_or_none(query, "reply"),
        nas_id=get("nasid"),
        session_id=get("sessionid"),
        user_url=get("userurl"),
        md=get("md"),
    )


def query_to_success(query: dict[str, list[str]]):
    assert (
        {
            "res",
            "uamip",
            "uamport",
            "called",
            "uid",
            "mac",
            "ip",
            "nasid",
            "sessionid",
            "userurl",
            "md",
        }
        <= query.keys()
        <= {
            "res",
            "uamip",
            "uamport",
            "called",
            "uid",
            "timeleft",
            "mac",
            "ip",
            "nasid",
            "sessionid",
            "userurl",
            "md",
        }
    )

    def get(name: str):
        return query_get(query, name)

    assert get("res") == "success"

    return Success(
        result="success",
        uam_ip=get("uamip"),
        uam_port=get("uamport"),
        called=get("called"),
        uid=get("uid"),
        time_left=query_get_or_none(query, "timeleft"),
        mac=get("mac"),
        ip=get("ip"),
        nas_id=get("nasid"),
        session_id=get("sessionid"),
        user_url=get("userurl"),
        md=get("md"),
    )


def query_to_already(query: dict[str, list[str]]):
    assert query.keys() == {
        "res",
        "uamip",
        "uamport",
        "called",
        "mac",
        "ip",
        "nasid",
        "sessionid",
        "userurl",
        "md",
    }

    def get(name: str):
        return query_get(query, name)

    assert get("res") == "already"

    return Already(
        result="already",
        uam_ip=get("uamip"),
        uam_port=get("uamport"),
        called=get("called"),
        mac=get("mac"),
        ip=get("ip"),
        nas_id=get("nasid"),
        session_id=get("sessionid"),
        user_url=get("userurl"),
        md=get("md"),
    )


def query_to_logoff(query: dict[str, list[str]]):
    assert query.keys() == {
        "res",
        "uamip",
        "uamport",
        "challenge",
        "called",
        "mac",
        "ip",
        "nasid",
        "sessionid",
        "userurl",
        "md",
    }

    def get(name: str):
        return query_get(query, name)

    assert get("res") == "logoff"

    return Logoff(
        result="logoff",
        uam_ip=get("uamip"),
        uam_port=get("uamport"),
        challenge=get("challenge"),
        called=get("called"),
        mac=get("mac"),
        ip=get("ip"),
        nas_id=get("nasid"),
        session_id=get("sessionid"),
        user_url=get("userurl"),
        md=get("md"),
    )


def query_to_result(query: dict[str, list[str]]):
    result = query_get(query, "res")

    if result == "notyet":
        return query_to_not_yet(query)
    elif result == "failed":
        return query_to_failed(query)
    elif result == "success":
        return query_to_success(query)
    elif result == "already":
        return query_to_already(query)
    elif result == "logoff":
        return query_to_logoff(query)
    else:
        assert False


def parse_qs(url: str):
    return urllib.parse.parse_qs(
        urllib.parse.urlparse(url).query, keep_blank_values=True, strict_parsing=True
    )


@dataclasses.dataclass
class Unown:
    uam_secret: bytes

    def check(self, url: str):
        check_url_md_param(url, self.uam_secret)

    def login_url(self, result: NotYet | Failed, username: str, password: str):
        return login_url(
            uam_secret=self.uam_secret,
            uam_ip=result.uam_ip,
            uam_port=result.uam_port,
            challenge=result.challenge,
            user_url=result.user_url,
            username=username,
            password=password,
        )

    def result(self, url: str):
        return query_to_result(parse_qs(url))


def login_url(
    uam_secret: bytes,
    uam_ip: str,
    uam_port: str,
    challenge: str,
    user_url: str,
    username: str,
    password: str,
):
    return urllib.parse.ParseResult(
        scheme="http",
        netloc=f"{uam_ip}:{uam_port}",
        path="/login",
        params="",
        query=urllib.parse.urlencode(
            (
                ("username", username),
                (
                    "response",
                    lampent.chilli_response.squawkabilly(
                        challenge, uam_secret, password
                    ),
                ),
                ("userurl", user_url),
            )
        ),
        fragment="",
    ).geturl()


# https://github.com/coova/coova-chilli/blob/master/miniportal/config-local.sh.in
# CHECK_MD5
# https://github.com/coova/coova-chilli/blob/master/src/redir.c
# redir_md_param
def check_url_md_param(url: str, uam_secret: bytes):
    m = re.fullmatch(".*&md=([0-9A-F]{32})", url)
    assert m is not None
    md_param = m.group(1)
    assert isinstance(md_param, str)
    original_url = url[: -(len("&md=") + len(md_param))]
    assert hashlib.md5(original_url.encode() + uam_secret).digest() == bytes.fromhex(
        md_param
    )
