import dataclasses
import itertools
from collections.abc import Iterable
from typing import Literal


@dataclasses.dataclass
class Board:
    data: list[list[Literal[0, 1] | None]]

    def get_value(self, position: tuple[int, int]):
        return self.data[position[0]][position[1]]

    def set_value(self, position: tuple[int, int], value: Literal[0, 1] | None):
        self.data[position[0]][position[1]] = value

    def length(self):
        return len(self.data)


def empty_board(length: int):
    return Board([[None] * length for _ in range(length)])


def set_up_board(board: Board):
    half_length = board.length() // 2
    board.set_value((half_length - 1, half_length - 1), 0)
    board.set_value((half_length - 1, half_length), 1)
    board.set_value((half_length, half_length - 1), 1)
    board.set_value((half_length, half_length), 0)


def default_board(length: int = 8):
    board = empty_board(length)
    set_up_board(board)
    return board


@dataclasses.dataclass
class Move:
    player: Literal[0, 1]
    position: tuple[int, int]


@dataclasses.dataclass
class State:
    board: Board
    next_player: Literal[0, 1]
    moves: list[Move]


def default_state():
    return State(board=default_board(), next_player=1, moves=[])


def get_row_flips(
    board: Board, player: Literal[0, 1], positions: Iterable[tuple[int, int]]
):
    flips = list[tuple[int, int]]()
    for position in positions:
        value = board.get_value(position)
        if value is None:
            return None
        if value == player:
            break
        flips.append(position)
    else:
        return None
    if len(flips):
        return flips
    return None


def get_ranges(length: int, position: tuple[int, int]):
    yield range(position[0] + 1, length), itertools.repeat(position[1])
    yield range(0, position[0])[::-1], itertools.repeat(position[1])
    yield itertools.repeat(position[0]), range(position[1] + 1, length)
    yield itertools.repeat(position[0]), range(0, position[1])[::-1]
    yield range(position[0] + 1, length), range(position[1] + 1, length)
    yield range(position[0] + 1, length), range(0, position[1])[::-1]
    yield range(0, position[0])[::-1], range(position[1] + 1, length)
    yield range(0, position[0])[::-1], range(0, position[1])[::-1]


def get_all_flips(board: Board, player: Literal[0, 1], position: tuple[int, int]):
    if board.get_value(position) is not None:
        return
    for range in get_ranges(board.length(), position):
        flips = get_row_flips(board, player, zip(*range))
        if flips is not None:
            yield from flips


@dataclasses.dataclass
class MoveOption:
    position: tuple[int, int]
    flips: list[tuple[int, int]]


@dataclasses.dataclass
class Reversi:
    state: State
    next_player_options: list[MoveOption] | None

    def options(self):
        player = self.state.next_player
        length = self.state.board.length()
        for i in range(length):
            for j in range(length):
                position = (i, j)
                flips = get_all_flips(self.state.board, player, position)
                try:
                    flip = next(flips)
                except StopIteration:
                    continue
                yield MoveOption(position=position, flips=[flip] + list(flips))

    def move(self, option: MoveOption):
        player = self.state.next_player
        self.state.board.set_value(option.position, player)
        for flip_position in option.flips:
            self.state.board.set_value(flip_position, player)
        move = Move(player=player, position=option.position)
        self.state.moves.append(move)

    def begin_turn(self):
        options = list(self.options())
        last_player_options = self.next_player_options
        if last_player_options is not None and not last_player_options and not options:
            return None
        self.next_player_options = options
        return options

    def end_turn(self, option_index: int | None):
        next_player_options = self.next_player_options
        assert next_player_options is not None
        if option_index is None:
            assert not next_player_options
        else:
            self.move(next_player_options[option_index])
        self.state.next_player = (self.state.next_player + 1) % 2


def default_reversi():
    return Reversi(state=default_state(), next_player_options=None)


def main():
    import random

    white_win = 0
    black_win = 0
    tie = 0

    for _ in range(1):
        reversi = default_reversi()
        reversi.state.board = default_board(length=6)
        while True:
            print("⚫" if reversi.state.next_player == 1 else "⚪")
            for row in reversi.state.board.data:
                print(
                    "|".join(
                        "  " if v is None else "⚫" if v == 1 else "⚪" for v in row
                    ),
                    sep="",
                )
            print()
            options = reversi.begin_turn()
            if options is None:
                break
            if options:
                reversi.end_turn(random.randrange(0, len(options)))
            else:
                reversi.end_turn(None)
        white_count = 0
        black_count = 0
        for i in range(reversi.state.board.length()):
            for j in range(reversi.state.board.length()):
                value = reversi.state.board.get_value((i, j))
                if value == 0:
                    white_count += 1
                elif value == 1:
                    black_count += 1
        if white_count > black_count:
            white_win += 1
        elif white_count == black_count:
            tie += 1
        else:
            black_win += 1

    print(white_win, black_win, tie)


if __name__ == "__main__":
    main()
