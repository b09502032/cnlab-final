import builtins
from typing import TypeVar

T = TypeVar("T")


def tuple_replace(tuple: builtins.tuple[T, ...], index: int, value: T):
    list = builtins.list(tuple)
    list[index] = value
    return builtins.tuple(list)
