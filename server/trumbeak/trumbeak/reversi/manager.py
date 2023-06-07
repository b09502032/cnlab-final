import asyncio
import copy
import dataclasses
from typing import Literal

import sqlalchemy.ext.asyncio
import starlette.websockets

import trumbeak.bad
import trumbeak.broker
import trumbeak.reversi.core
import trumbeak.reversi.crud
import trumbeak.reversi.message
import trumbeak.users.manager
import trumbeak.utils


@dataclasses.dataclass
class ReversiSpace:
    id: int
    owner: int
    players: tuple[int | None, int | None]
    reversi: trumbeak.reversi.core.Reversi
    session_maker: sqlalchemy.ext.asyncio.async_sessionmaker[
        sqlalchemy.ext.asyncio.AsyncSession
    ]
    broker: trumbeak.broker.Broker[trumbeak.reversi.message.Message]
    user_manager: trumbeak.users.manager.Manager
    octet: int = 100000000

    def get_state_update(self):
        return trumbeak.reversi.message.StateUpdate(copy.deepcopy(self.reversi.state))

    def get_player_update(self):
        return trumbeak.reversi.message.PlayerUpdate(copy.deepcopy(self.players))

    async def add_subscriber(
        self, subscriber: trumbeak.broker.Subscriber[trumbeak.reversi.message.Message]
    ):
        state_update = self.get_state_update()
        player_update = self.get_player_update()
        if self.reversi.ended:
            move_options = trumbeak.reversi.message.MoveOptions(
                len(self.reversi.state.moves), None
            )
        else:
            next_player_options = self.reversi.next_player_options
            if next_player_options is not None:
                move_options = trumbeak.reversi.message.MoveOptions(
                    len(self.reversi.state.moves), copy.deepcopy(next_player_options)
                )
            else:
                move_options = None
        await subscriber.send(state_update)
        await subscriber.send(player_update)
        if move_options is not None:
            await subscriber.send(move_options)
        self.broker.subscribers.append(subscriber)

    async def start(self):
        state_update = self.get_state_update()
        player_update = self.get_player_update()
        await self.broker.send(state_update)
        await self.broker.send(player_update)

    async def begin_turn(self):
        options = self.reversi.begin_turn()
        move_options = trumbeak.reversi.message.MoveOptions(
            len(self.reversi.state.moves), copy.deepcopy(options)
        )
        await self.broker.send(move_options)
        return options

    async def end_turn_by_user(
        self, user_id: int, move_selection: trumbeak.reversi.message.MoveSelection
    ):
        assert self.players[self.reversi.state.next_player] == user_id
        assert move_selection.id == len(self.reversi.state.moves)
        await self.end_turn(move_selection.index)

    async def end_turn(self, option_index: int | None):
        self.reversi.end_turn(option_index)
        await self.update_state()

    async def handle_receive(
        self, receiver: trumbeak.reversi.message.Receiver, user_id: int
    ):
        while True:
            message = await receiver.receive()
            if isinstance(message, trumbeak.reversi.message.ChoosePlayer):
                assert user_id not in self.players
                await self.update_player(message.index, user_id)
            elif isinstance(message, trumbeak.reversi.message.MoveSelection):
                await self.end_turn_by_user(user_id, message)
                while True:
                    options = await self.begin_turn()
                    if options is None:
                        assert self.reversi.ended
                        white_count = 0
                        black_count = 0
                        for i in range(self.reversi.state.board.length()):
                            for j in range(self.reversi.state.board.length()):
                                value = self.reversi.state.board.get_value((i, j))
                                if value == 0:
                                    white_count += 1
                                elif value == 1:
                                    black_count += 1
                        if white_count > black_count:
                            winners = (self.players[0],)
                        elif white_count == black_count:
                            winners = self.players
                            self.octet //= 2
                        else:
                            winners = (self.players[1],)
                        for winner in winners:
                            assert winner is not None
                            await self.user_manager.add_octet(winner, self.octet)
                        break
                    if options:
                        break
                    await self.end_turn(None)

    async def update_player(self, index: Literal[0, 1], user_id: int):
        assert self.players[index] is None
        players = trumbeak.utils.tuple_replace(self.players, index, user_id)
        assert len(players) == 2
        players = (players[0], players[1])
        self.players = players
        async with self.session_maker() as session:
            await trumbeak.reversi.crud.update_player(session, self.id, self.players)
            await session.commit()
        await self.broker.send(self.get_player_update())
        if all(player is not None for player in self.players):
            await self.begin_turn()

    async def update_state(self):
        async with self.session_maker() as session:
            await trumbeak.reversi.crud.update_state(
                session, self.id, copy.deepcopy(self.reversi.state)
            )
            await session.commit()
        await self.broker.send(self.get_state_update())


@dataclasses.dataclass
class Manager:
    session_maker: sqlalchemy.ext.asyncio.async_sessionmaker[
        sqlalchemy.ext.asyncio.AsyncSession
    ]
    spaces: dict[int, ReversiSpace]
    user_manager: trumbeak.users.manager.Manager

    async def create_reversi(self, owner: int):
        async with self.session_maker() as session:
            reversi = await trumbeak.reversi.crud.create_reversi(session, owner)
            await session.commit()
        space = ReversiSpace(
            id=reversi.id,
            owner=owner,
            players=reversi.players,
            reversi=trumbeak.reversi.core.Reversi(
                state=reversi.state, next_player_options=None, ended=False
            ),
            session_maker=self.session_maker,
            broker=trumbeak.broker.Broker([]),
            user_manager=self.user_manager,
        )
        self.spaces[space.id] = space
        return space.id

    def list_reversi(self):
        return list(self.spaces.keys())

    async def get_reversi(self, id: int):
        async with self.session_maker() as session:
            return await trumbeak.reversi.crud.get_reversi(session, id)

    async def enter_reversi(
        self, socket: starlette.websockets.WebSocket, id: int, user_id: int | None
    ):
        await socket.accept()

        space = self.spaces[id]
        subscriber = trumbeak.reversi.message.Subscriber(
            trumbeak.broker.WebSocketSubscriber(socket)
        )
        await space.add_subscriber(subscriber)

        if user_id is None:
            await asyncio.Event().wait()

        receiver = trumbeak.reversi.message.Receiver(trumbeak.broker.Receiver(socket))
        await space.handle_receive(receiver, user_id)
