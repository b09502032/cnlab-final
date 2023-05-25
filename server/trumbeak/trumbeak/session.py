import dataclasses
import secrets
import time


@dataclasses.dataclass
class SessionInfo:
    user_id: int
    expire: int


@dataclasses.dataclass
class Manager:
    sessions: dict[str, SessionInfo]

    def new_session_id(self):
        return secrets.token_hex(32)

    def add_session_info(self, session_info: SessionInfo):
        session_id = self.new_session_id()
        self.sessions[session_id] = session_info
        return session_id

    def get_session_info(self, session_id: str):
        try:
            session_info = self.sessions[session_id]
        except KeyError:
            return None
        if time.time() >= session_info.expire:
            del self.sessions[session_id]
            return None
        return session_info

    def get_user_id(self, session_id: str):
        session_info = self.get_session_info(session_id)
        if session_info is None:
            return None
        return session_info.user_id
