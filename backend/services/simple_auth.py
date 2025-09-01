"""
Simple OAuth authentication service
Just handles Google, Facebook, GitHub OAuth and Stripe customer creation
"""

import os
import requests
import logging
from datetime import datetime, UTC
from sqlalchemy.orm import Session
from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from jose.utils import base64url_decode
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicNumbers
from database.models import User
from database.database import get_db
import stripe
from dotenv import load_dotenv

load_dotenv()

# Setup logging
logger = logging.getLogger(__name__)

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
            user.last_login = datetime.now(UTC)
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
        now = datetime.now(UTC)
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
        now = datetime.now(UTC)
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
        
        now = datetime.now(UTC)
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
        
        now = datetime.now(UTC)
        year_month = f"{now.year}-{now.month:02d}"
        
        usage = UsageRecord(
            ip_address=ip_address,
            user_email=email,
            minutes_used=minutes,
            year_month=year_month
        )
        
        db.add(usage)
        db.commit()


# Keycloak Configuration
KEYCLOAK_SERVER_URL = os.getenv("KEYCLOAK_SERVER_URL", "http://localhost:8080")
KEYCLOAK_REALM = os.getenv("KEYCLOAK_REALM", "ebl-realm")
KEYCLOAK_CLIENT_ID = os.getenv("KEYCLOAK_CLIENT_ID", "ebl-app")

security = HTTPBearer()


def get_keycloak_public_key():
    """Get Keycloak public key for token validation"""
    try:
        url = f"{KEYCLOAK_SERVER_URL}/realms/{KEYCLOAK_REALM}/protocol/openid_connect/certs"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Failed to get Keycloak public key: {e}")
        return None


def validate_keycloak_token(token: str):
    """
    Validate Keycloak JWT token.
    
    Args:
        token: JWT token from Keycloak
        
    Returns:
        Decoded token payload if valid, None otherwise
    """
    try:
        # For now, use a simple validation approach
        # In production, you'd want to validate against Keycloak's public key
        
        # First, try to decode without verification to check structure
        unverified_payload = jwt.get_unverified_claims(token)
        
        # Basic validation checks
        if not unverified_payload.get("iss", "").startswith(KEYCLOAK_SERVER_URL):
            logger.warning("Token issuer doesn't match Keycloak server")
            return None
            
        if unverified_payload.get("aud") != KEYCLOAK_CLIENT_ID:
            logger.warning("Token audience doesn't match client ID")
            return None
            
        # For development, return the payload
        # TODO: Implement full JWKS validation for production
        logger.info("Token validation bypassed for development")
        return unverified_payload
        
    except JWTError as e:
        logger.warning(f"Invalid Keycloak token: {e}")
        return None
    except Exception as e:
        logger.error(f"Error validating Keycloak token: {e}")
        return None


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Dependency to get current authenticated user from Keycloak JWT token.
    
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
        payload = validate_keycloak_token(credentials.credentials)
        if payload is None:
            raise credentials_exception
            
        email: str = payload.get("email") or payload.get("preferred_username")
        if email is None:
            raise credentials_exception
            
        # Get or create user from database
        user = db.query(User).filter(User.email == email).first()
        if user is None:
            # Create user from Keycloak token
            user = User(
                email=email,
                name=payload.get("name", email),
                oauth_provider="keycloak",
                is_premium=False  # Default to free tier
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            logger.info(f"Created new user from Keycloak: {email}")
            
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        raise credentials_exception