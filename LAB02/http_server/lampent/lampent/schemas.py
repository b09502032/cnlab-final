import dataclasses

# import datetime


@dataclasses.dataclass
class User:
    username: str
    password: str


@dataclasses.dataclass
class UserInfo:
    username: str
    all_session: int
    all_total_octets: int
    max_all_session: int | None
    max_all_total_octets: int | None


@dataclasses.dataclass
class UserInfoUpdate:
    username: str
    max_all_session: str
    max_all_total_octets: str


# @dataclasses.dataclass
# class Accounting:
#     accounting_session_id: str
#     accounting_unique_id: str
#     username: str
#     nas_ip_address: str
#     accounting_start_time: datetime.datetime | None
#     accounting_update_time: datetime.datetime | None
#     accounting_stop_time: datetime.datetime | None
#     acctsessiontime: int | None
#     accounting_input_octets: int | None
#     accounting_output_octets: int | None
