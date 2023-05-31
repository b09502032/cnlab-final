import dataclasses
from typing import Literal

import pydantic

import trumbeak.broker
import trumbeak.reversi.core


@dataclasses.dataclass
class PlayerUpdate:
    players: tuple[int | None, int | None]


@dataclasses.dataclass
class StateUpdate:
    state: trumbeak.reversi.core.State


@dataclasses.dataclass
class MoveOptions:
    id: int
    options: list[trumbeak.reversi.core.MoveOption] | None


Message = PlayerUpdate | StateUpdate | MoveOptions


@dataclasses.dataclass
class MoveSelection:
    id: int
    index: int


@dataclasses.dataclass
class ChoosePlayer:
    index: Literal[0, 1]


@dataclasses.dataclass
class Subscriber(trumbeak.broker.Subscriber[Message]):
    subscriber: trumbeak.broker.WebSocketSubscriber

    def send(self, message: Message):
        return self.subscriber.send(
            {"type": type(message).__name__, "data": dataclasses.asdict(message)}
        )


@dataclasses.dataclass
class Receiver:
    receiver: trumbeak.broker.Receiver

    async def receive(self):
        message = await self.receiver.receive()
        assert isinstance(message, dict)
        assert message.keys() == {"type", "data"}
        message_type = message["type"]
        assert isinstance(message_type, str)
        for type in (MoveSelection, ChoosePlayer):
            if message_type == type.__name__:
                return pydantic.parse_obj_as(type, message["data"])
        assert False
