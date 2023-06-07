import ast
import asyncio
import asyncio.subprocess
import dataclasses
import enum
import tempfile
from collections.abc import Iterable


def assert_str(o):
    assert isinstance(o, str)
    return o


class Command(enum.Enum):
    auth = "auth"
    coa = "coa"
    disconnect = "disconnect"


@dataclasses.dataclass
class Pair:
    name: str
    value: str


def pair_to_str(pair: Pair):
    return "{}='{}'".format(pair.name, pair.value.replace("'", "\\'")).replace(
        "\\", "\\\\"
    )


@dataclasses.dataclass
class Packet:
    pairs: list[Pair]


def packet_to_str(packet: Packet):
    return ",".join(pair_to_str(pair) for pair in packet.pairs)


async def communicate(process: asyncio.subprocess.Process, input):
    stdout_data, stderr_data = await process.communicate(input)
    assert isinstance(stdout_data, bytes)
    assert isinstance(stderr_data, bytes)
    return stdout_data, stderr_data


@dataclasses.dataclass
class Client:
    program: str

    async def run(
        self,
        server: str,
        port: int,
        command: Command,
        secret: bytes,
        packets: Iterable[Packet],
    ):
        with tempfile.NamedTemporaryFile() as file:
            file.write(secret)
            file.flush()
            process = await asyncio.create_subprocess_exec(
                self.program,
                "-S",
                file.name,
                "-x",
                "--",
                f"{server}:{port}",
                assert_str(command.value),
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdin_data = (
                "\n".join(packet_to_str(packet) for packet in packets) + "\n"
            ).encode()
            stdout_data, stderr_data = await communicate(process, stdin_data)
            return tuple(parse_stdout_data(stdout_data)), stderr_data


@dataclasses.dataclass
class Message:
    name: bytes
    id: bytes
    from_: bytes
    to: bytes
    length: bytes
    pairs: list[Pair]


class Request(Message):
    pass


class Response(Message):
    pass


def line_to_request(line: bytes):
    (
        sent,
        name,
        id_prefix,
        id,
        from_prefix,
        from_,
        to_prefix,
        to,
        length_prefix,
        length,
    ) = line.split(b" ")
    assert sent == b"Sent"
    assert id_prefix == b"Id"
    assert from_prefix == b"from"
    assert to_prefix == b"to"
    assert length_prefix == b"length"
    return Request(name=name, id=id, from_=from_, to=to, length=length, pairs=[])


def line_to_response(line: bytes):
    (
        received,
        name,
        id_prefix,
        id,
        from_prefix,
        from_,
        to_prefix,
        to,
        length_prefix,
        length,
    ) = line.split(b" ")
    assert received == b"Received"
    assert id_prefix == b"Id"
    assert from_prefix == b"from"
    assert to_prefix == b"to"
    assert length_prefix == b"length"
    return Response(name=name, id=id, from_=from_, to=to, length=length, pairs=[])


def line_to_pair(line: bytes):
    decoded_line = line.decode()
    assert decoded_line.startswith("\t")
    name, value = decoded_line[len("\t") :].split(" = ")
    if value.startswith('"'):
        assert value.endswith('"')
        value = ast.literal_eval(value)
        assert isinstance(value, str)
    return Pair(name, value)


def parse_stdout_data(stdout: bytes):
    message = None
    for line in stdout.splitlines():
        if line.startswith(b"Sent "):
            if message is not None:
                yield message
            message = line_to_request(line)
        elif line.startswith(b"Received "):
            if message is not None:
                yield message
            message = line_to_response(line)
        elif line.startswith(b"\t") and message is not None:
            message.pairs.append(line_to_pair(line))
        else:
            assert False, stdout
    if message is not None:
        yield message


@dataclasses.dataclass
class Araquanid:
    client: Client
    server: str
    port: int
    secret: bytes

    def auth(self, username: str, password: str):
        return self.client.run(
            self.server,
            self.port,
            Command.auth,
            self.secret,
            (Packet([Pair("User-Name", username), Pair("User-Password", password)]),),
        )

    def disconnect(self, username: str, pairs: Iterable[Pair]):
        packet = Packet([Pair("User-Name", username)])
        packet.pairs.extend(pairs)
        return self.client.run(
            self.server, self.port, Command.disconnect, self.secret, (packet,)
        )

    def coa(self, username: str, pairs: Iterable[Pair]):
        packet = Packet([Pair("User-Name", username)])
        packet.pairs.extend(pairs)
        return self.client.run(
            self.server, self.port, Command.coa, self.secret, (packet,)
        )


def create_araquanid(server: str, port: int, secret: bytes):
    return Araquanid(
        client=Client("radclient"), server=server, port=port, secret=secret
    )
