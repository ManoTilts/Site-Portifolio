from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from jose import JWTError, jwt
from fastapi import HTTPException, status

from app.config.settings import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def verify_access_token(token: str) -> Dict[str, Any]:
    """Verify and decode JWT access token"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        
        # Check if token is expired
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check token type
        token_type = payload.get("type")
        if token_type != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return payload
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def create_password_reset_token(email: str) -> str:
    """Create password reset token"""
    data = {
        "email": email,
        "type": "password_reset"
    }
    
    # Password reset tokens expire in 1 hour
    expires_delta = timedelta(hours=1)
    return create_access_token(data, expires_delta)


def verify_password_reset_token(token: str) -> str:
    """Verify password reset token and return email"""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        
        # Check token type
        token_type = payload.get("type")
        if token_type != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token type"
            )
        
        email = payload.get("email")
        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token"
            )
        
        return email
        
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )


def generate_api_key() -> str:
    """Generate a random API key"""
    import secrets
    import string
    
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(32))


def hash_api_key(api_key: str) -> str:
    """Hash an API key for storage"""
    return get_password_hash(api_key)


def verify_api_key(api_key: str, hashed_api_key: str) -> bool:
    """Verify an API key against its hash"""
    return verify_password(api_key, hashed_api_key)


def create_csrf_token() -> str:
    """Create CSRF token for form protection"""
    import secrets
    return secrets.token_urlsafe(32)


def verify_csrf_token(token: str, expected_token: str) -> bool:
    """Verify CSRF token"""
    import hmac
    return hmac.compare_digest(token, expected_token)


def mask_sensitive_data(data: str, visible_chars: int = 4) -> str:
    """Mask sensitive data leaving only specified number of characters visible"""
    if len(data) <= visible_chars:
        return "*" * len(data)
    
    return data[:visible_chars] + "*" * (len(data) - visible_chars)


def is_strong_password(password: str) -> tuple[bool, list[str]]:
    """Check if password meets strength requirements"""
    errors = []
    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    
    if not any(c.isupper() for c in password):
        errors.append("Password must contain at least one uppercase letter")
    
    if not any(c.islower() for c in password):
        errors.append("Password must contain at least one lowercase letter")
    
    if not any(c.isdigit() for c in password):
        errors.append("Password must contain at least one digit")
    
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        errors.append("Password must contain at least one special character")
    
    return len(errors) == 0, errors 