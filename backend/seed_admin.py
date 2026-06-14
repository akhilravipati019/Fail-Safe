"""
Create (or update) a teacher account for logging into FAILSAFE.

Interactive usage:
    python seed_admin.py

Non-interactive usage (e.g. Render deploy hooks/one-off jobs), via env vars:
    SEED_TEACHER_USERNAME=admin SEED_TEACHER_PASSWORD=Sup3rSecret SEED_TEACHER_FULL_NAME="Admin" python seed_admin.py
"""
import getpass
import os
import re
import sys

from app import models
from app.database import Base, SessionLocal, engine
from app.security import hash_password

Base.metadata.create_all(bind=engine)


def validate_password(password: str) -> str | None:
    if len(password) < 8:
        return "Password must be at least 8 characters long."
    if not re.search(r"[A-Za-z]", password):
        return "Password must contain at least one letter."
    if not re.search(r"[0-9]", password):
        return "Password must contain at least one digit."
    return None


def upsert_teacher(db, username: str, full_name: str, password: str) -> str:
    existing = db.query(models.Teacher).filter(models.Teacher.username == username).first()
    hashed = hash_password(password)

    if existing:
        existing.hashed_password = hashed
        existing.full_name = full_name or existing.full_name
        db.commit()
        return f"Updated password for existing teacher '{username}'."

    teacher = models.Teacher(username=username, full_name=full_name, hashed_password=hashed)
    db.add(teacher)
    db.commit()
    return f"Created teacher account '{username}'."


def main():
    db = SessionLocal()
    try:
        env_username = os.environ.get("SEED_TEACHER_USERNAME")
        env_password = os.environ.get("SEED_TEACHER_PASSWORD")

        if env_username and env_password:
            full_name = os.environ.get("SEED_TEACHER_FULL_NAME", "")
            error = validate_password(env_password)
            if error:
                print(error)
                sys.exit(1)
            print(upsert_teacher(db, env_username.strip(), full_name.strip(), env_password))
            return

        username = input("Teacher username: ").strip()
        if not username:
            print("Username cannot be empty.")
            sys.exit(1)

        full_name = input("Full name: ").strip()

        while True:
            password = getpass.getpass("Password (min 8 chars, letters + digits): ")
            error = validate_password(password)
            if error:
                print(error)
                continue
            confirm = getpass.getpass("Confirm password: ")
            if password != confirm:
                print("Passwords do not match.")
                continue
            break

        print(upsert_teacher(db, username, full_name, password))
    finally:
        db.close()


if __name__ == "__main__":
    main()
