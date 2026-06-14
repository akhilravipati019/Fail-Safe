import time
from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


# --- Simple in-memory login rate limiter (per username) ---
# Stores: username -> (failed_attempt_count, locked_until_timestamp)
_login_attempts: dict[str, tuple[int, float]] = {}


def is_locked_out(username: str) -> Optional[int]:
    """Returns remaining lockout seconds if locked out, else None."""
    record = _login_attempts.get(username)
    if not record:
        return None
    _, locked_until = record
    remaining = locked_until - time.time()
    if remaining > 0:
        return int(remaining)
    return None


def record_failed_login(username: str) -> None:
    count, _ = _login_attempts.get(username, (0, 0.0))
    count += 1
    locked_until = 0.0
    if count >= settings.login_max_attempts:
        locked_until = time.time() + settings.login_lockout_minutes * 60
    _login_attempts[username] = (count, locked_until)


def reset_login_attempts(username: str) -> None:
    _login_attempts.pop(username, None)
