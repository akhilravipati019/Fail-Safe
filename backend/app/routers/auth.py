from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas, security
from ..database import get_db
from ..deps import get_current_teacher

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    username = payload.username.strip()

    locked_seconds = security.is_locked_out(username)
    if locked_seconds is not None:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed login attempts. Try again in {locked_seconds // 60 + 1} minute(s).",
        )

    teacher = db.query(models.Teacher).filter(models.Teacher.username == username).first()

    if not teacher or not security.verify_password(payload.password, teacher.hashed_password):
        security.record_failed_login(username)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
        )

    security.reset_login_attempts(username)
    token = security.create_access_token(subject=teacher.username)
    return schemas.TokenResponse(access_token=token)


@router.get("/me", response_model=schemas.TeacherOut)
def me(current_teacher: models.Teacher = Depends(get_current_teacher)):
    return current_teacher
