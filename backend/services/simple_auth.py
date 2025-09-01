"""
Simple OAuth authentication service
Just handles Google, Facebook, GitHub OAuth and Stripe customer creation
"""

import os
import requests
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from database.models import User
from database.database import get_db
import stripe
from dotenv import load_dotenv

load_dotenv()

# Stripe setup
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class SimpleAuthService:
    """Simple auth service using OAuth providers directly"""
    
    def __init__(self):
        self.google_client_id = os.getenv("GOOGLE_CLIENT_ID")
        self.facebook_app_id = os.getenv("FACEBOOK_APP_ID")
        self.github_client_id = os.getenv("GITHUB_CLIENT_ID")
    
    async def verify_google_token(self, token: str) -> dict:
        """Verify Google OAuth token and get user info"""
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
        response = requests.get(url)
        if response.status_code == 200:
            user_info = response.json()
            return {
                "email": user_info.get("email"),
                "name": user_info.get("name"),
                "provider": "google"
            }
        return None
    
    async def verify_github_token(self, token: str) -> dict:
        """Verify GitHub OAuth token and get user info"""
        headers = {"Authorization": f"token {token}"}
        response = requests.get("https://api.github.com/user", headers=headers)
        if response.status_code == 200:
            user_info = response.json()
            # Get email from separate endpoint
            email_response = requests.get("https://api.github.com/user/emails", headers=headers)
            emails = email_response.json() if email_response.status_code == 200 else []
            primary_email = next((e["email"] for e in emails if e["primary"]), None)
            
            return {
                "email": primary_email or user_info.get("email"),
                "name": user_info.get("name"),
                "provider": "github"
            }
        return None
    
    async def get_or_create_user(self, email: str, provider: str, db: Session) -> User:
        """Get existing user or create new one with Stripe customer"""
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            # Update last login
            user.last_login = datetime.utcnow()
            db.commit()
            return user
        
        # Create new user
        user = User(
            email=email,
            oauth_provider=provider,
            is_premium=False
        )
        
        # Create Stripe customer
        try:
            stripe_customer = stripe.Customer.create(
                email=email,
                metadata={"oauth_provider": provider}
            )
            user.stripe_customer_id = stripe_customer.id
        except Exception as e:
            print(f"Failed to create Stripe customer: {e}")
            # Continue without Stripe customer for now
        
        db.add(user)
        db.commit()
        
        return user
    
    def check_usage_limit_by_ip(self, ip_address: str, db: Session) -> dict:
        """Check if IP has exceeded free tier usage (3 hours/month)"""
        from database.models import UsageRecord
        
        # Get current month
        now = datetime.utcnow()
        year_month = f"{now.year}-{now.month:02d}"
        
        # Check monthly usage for this IP
        total_minutes = db.query(UsageRecord).filter(
            UsageRecord.ip_address == ip_address,
            UsageRecord.year_month == year_month
        ).with_entities(UsageRecord.minutes_used).all()
        
        total = sum(r[0] for r in total_minutes) if total_minutes else 0
        limit_minutes = 3 * 60  # 3 hours = 180 minutes
        
        return {
            "used_minutes": total,
            "limit_minutes": limit_minutes,
            "remaining_minutes": max(0, limit_minutes - total),
            "can_use": total < limit_minutes,
            "requires_login": total >= limit_minutes
        }
    
    def check_usage_limit_by_email(self, email: str, db: Session) -> dict:
        """Check if user has exceeded free tier usage (for logged in users)"""
        from database.models import UsageRecord
        
        # Get current month
        now = datetime.utcnow()
        year_month = f"{now.year}-{now.month:02d}"
        
        # Check monthly usage for this email
        total_minutes = db.query(UsageRecord).filter(
            UsageRecord.user_email == email,
            UsageRecord.year_month == year_month
        ).with_entities(UsageRecord.minutes_used).all()
        
        total = sum(r[0] for r in total_minutes) if total_minutes else 0
        limit_minutes = 3 * 60  # 3 hours = 180 minutes
        
        return {
            "used_minutes": total,
            "limit_minutes": limit_minutes,
            "remaining_minutes": max(0, limit_minutes - total),
            "can_use": total < limit_minutes,
            "requires_login": False  # Already logged in
        }
    
    def record_usage_by_ip(self, ip_address: str, minutes: float, db: Session):
        """Record usage for anonymous IP address"""
        from database.models import UsageRecord
        
        now = datetime.utcnow()
        year_month = f"{now.year}-{now.month:02d}"
        
        usage = UsageRecord(
            ip_address=ip_address,
            user_email=None,  # Anonymous usage
            minutes_used=minutes,
            year_month=year_month
        )
        
        db.add(usage)
        db.commit()
    
    def record_usage_by_email(self, email: str, ip_address: str, minutes: float, db: Session):
        """Record usage for logged in user"""
        from database.models import UsageRecord
        
        now = datetime.utcnow()
        year_month = f"{now.year}-{now.month:02d}"
        
        usage = UsageRecord(
            ip_address=ip_address,
            user_email=email,
            minutes_used=minutes,
            year_month=year_month
        )
        
        db.add(usage)
        db.commit()


# JWT Configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"

security = HTTPBearer()


def create_access_token(data: dict):
    """Create JWT access token"""
    to_encode = data.copy()
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str):
    """Decode JWT access token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Dependency to get current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Authorization header with Bearer token
        db: Database session
        
    Returns:
        User object if authenticated
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = decode_access_token(credentials.credentials)
        if payload is None:
            raise credentials_exception
            
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    # Get user from database
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
        
    return user