import abc
import dataclasses
from typing import Generic, TypeVar

import starlette.websockets

T = TypeVar("T")


class Subscriber(abc.ABC, Generic[T]):
    @abc.abstractmethod
    async def send(self, message: T):
        raise NotImplementedError


@dataclasses.dataclass
class Broker(Generic[T]):
    subscribers: list[Subscriber[T]]

    async def send(self, message: T):
        for subscriber in self.subscribers:
            await subscriber.send(message)


@dataclasses.dataclass
class WebSocketSubscriber(Subscriber):
    socket: starlette.websockets.WebSocket

    def send(self, message):
        return self.socket.send_json(message)


@dataclasses.dataclass
class Receiver:
    socket: starlette.websockets.WebSocket

    def receive(self):
        return self.socket.receive_json()
