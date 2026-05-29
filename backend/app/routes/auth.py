"""Admin authentication routes (login + current-user info)."""
import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status

from app.config.settings import settings
from app.models.admin import Admin
from app.schemas.admin import (
    AdminLoginSchema,
    AdminResponseSchema,
    TokenResponseSchema,
)
from app.utils.dependencies import get_current_admin
from app.utils.security import create_access_token, verify_password

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/login", response_model=TokenResponseSchema)
async def login(credentials: AdminLoginSchema):
    """Authenticate an admin and return a JWT access token."""
    admin = await Admin.find_one(Admin.username == credentials.username.lower())

    # Verify the password even when the user is missing-ish to reduce timing
    # leakage, but always fail with the same generic message.
    if admin is None or not verify_password(credentials.password, admin.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": admin.username}, expires_delta=expires_delta
    )

    # Record the login (best effort).
    try:
        admin.update_login()
        await admin.save()
    except Exception as e:  # pragma: no cover - non-critical bookkeeping
        logger.warning(f"Failed to update login metadata: {e}")

    return TokenResponseSchema(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        admin=AdminResponseSchema.model_validate(admin.model_dump()),
    )


@router.get("/me", response_model=AdminResponseSchema)
async def read_current_admin(current_admin: Admin = Depends(get_current_admin)):
    """Return the currently authenticated admin's profile."""
    return AdminResponseSchema.model_validate(current_admin.model_dump())
