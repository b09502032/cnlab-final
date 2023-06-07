import hashlib

# https://datatracker.ietf.org/doc/html/rfc1994


def response(identifier: bytes, secret: bytes, challenge: bytes):
    assert len(identifier) == 1
    assert secret, repr(secret)
    return hashlib.md5(b"".join((identifier, secret, challenge))).digest()
