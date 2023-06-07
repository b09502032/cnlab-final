import hashlib

import lampent.chap

# https://github.com/coova/coova-chilli/blob/master/src/main-response.c
# https://coova.github.io/CoovaChilli/chilli_response(1).html


def real_challenge(challenge: bytes, uam_secret: bytes):
    return hashlib.md5(challenge + uam_secret).digest()


def chap_response(challenge: bytes, password: bytes, identifier: bytes):
    return lampent.chap.response(identifier, password, challenge)


def squawkabilly(challenge: str, uam_secret: bytes, password: str):
    return chap_response(
        real_challenge(bytes.fromhex(challenge), uam_secret), password.encode(), b"\x00"
    ).hex()
