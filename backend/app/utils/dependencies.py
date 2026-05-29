"""Reusable FastAPI dependencies (authentication, etc.)."""
import logging

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.models.admin import Admin
from app.utils.security import verify_access_token

logger = logging.getLogger(__name__)

# HTTPBearer extracts the "Authorization: Bearer <token>" header.
# auto_error=True -> missing/!malformed header returns 403 automatically.
bearer_scheme = HTTPBearer()


async def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Admin:
    """Resolve and validate the authenticated admin from the bearer token.

    Raises 401 if the token is invalid/expired or the admin no longer exists
    or is inactive. Use as a route dependency to protect admin-only endpoints.
    """
    payload = verify_access_token(credentials.credentials)

    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    admin = await Admin.find_one(Admin.username == username)
    if admin is None or not admin.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin account not found or inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return admin
