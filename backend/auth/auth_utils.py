"""
Authentication utilities for JWT token management and OAuth
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
import os
from dotenv import load_dotenv
import secrets
import string

load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your_fallback_secret_key")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hash a password
    """
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Dict[str, Any]:
    """
    Verify and decode a JWT token
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def generate_session_token() -> str:
    """
    Generate a secure session token
    """
    return secrets.token_urlsafe(32)

def generate_secure_password(length: int = 12) -> str:
    """
    Generate a secure random password
    """
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def validate_email(email: str) -> bool:
    """
    Basic email validation
    """
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def extract_oauth_info(provider: str, user_info: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extract standardized user info from OAuth provider response
    """
    if provider == "google":
        return {
            "oauth_id": user_info.get("sub"),
            "email": user_info.get("email"),
            "full_name": user_info.get("name"),
            "is_verified": user_info.get("email_verified", False)
        }
    elif provider == "github":
        return {
            "oauth_id": str(user_info.get("id")),
            "email": user_info.get("email"),
            "full_name": user_info.get("name") or user_info.get("login"),
            "is_verified": True  # GitHub emails are considered verified
        }
    elif provider == "facebook":
        return {
            "oauth_id": user_info.get("id"),
            "email": user_info.get("email"),
            "full_name": user_info.get("name"),
            "is_verified": True  # Facebook emails are considered verified
        }
    else:
        raise ValueError(f"Unsupported OAuth provider: {provider}")

class TokenData:
    """
    Token data class for type hints
    """
    def __init__(self, user_id: Optional[str] = None, email: Optional[str] = None):
        self.user_id = user_id
        self.email = email