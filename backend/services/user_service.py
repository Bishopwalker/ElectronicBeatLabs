"""
User management service
"""

from sqlalchemy.orm import Session
from database.models import User, UsageRecord, UserSession
from auth.auth_utils import get_password_hash, verify_password, create_access_token, extract_oauth_info
from services.stripe_service import StripeService
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import uuid
import logging

logger = logging.getLogger(__name__)

class UserService:
    """
    Service class for user management operations
    """
    
    def __init__(self):
        self.stripe_service = StripeService()
    
    async def create_user(
        self, 
        email: str, 
        password: Optional[str] = None, 
        full_name: Optional[str] = None,
        oauth_provider: Optional[str] = None,
        oauth_id: Optional[str] = None,
        is_verified: bool = False,
        db: Session = None
    ) -> User:
        """
        Create a new user account
        """
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            if oauth_provider and existing_user.oauth_provider != oauth_provider:
                # Link OAuth account to existing user
                existing_user.oauth_provider = oauth_provider
                existing_user.oauth_id = oauth_id
                existing_user.is_verified = True
                db.commit()
                return existing_user
            else:
                raise ValueError("User with this email already exists")
        
        # Create new user
        user_data = {
            "id": str(uuid.uuid4()),
            "email": email,
            "full_name": full_name,
            "is_verified": is_verified,
            "oauth_provider": oauth_provider,
            "oauth_id": oauth_id
        }
        
        if password:
            user_data["hashed_password"] = get_password_hash(password)
        
        user = User(**user_data)
        db.add(user)
        db.flush()  # Get the user ID
        
        try:
            # Create Stripe customer
            stripe_customer_id = await self.stripe_service.create_customer(user)
            user.stripe_customer_id = stripe_customer_id
            
            db.commit()
            logger.info(f"Created user {user.id} with Stripe customer {stripe_customer_id}")
            return user
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to create user: {e}")
            raise
    
    async def authenticate_user(self, email: str, password: str, db: Session) -> Optional[User]:
        """
        Authenticate user with email and password
        """
        user = db.query(User).filter(User.email == email).first()
        if not user or not user.hashed_password:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        return user
    
    async def authenticate_oauth_user(
        self, 
        provider: str, 
        user_info: Dict[str, Any], 
        db: Session
    ) -> User:
        """
        Authenticate or create user from OAuth provider
        """
        oauth_data = extract_oauth_info(provider, user_info)
        
        # Try to find existing user by OAuth ID or email
        user = db.query(User).filter(
            (User.oauth_provider == provider) & (User.oauth_id == oauth_data["oauth_id"])
        ).first()
        
        if not user and oauth_data["email"]:
            user = db.query(User).filter(User.email == oauth_data["email"]).first()
            if user:
                # Link OAuth account to existing user
                user.oauth_provider = provider
                user.oauth_id = oauth_data["oauth_id"]
                user.is_verified = oauth_data["is_verified"]
                user.last_login = datetime.utcnow()
                db.commit()
                return user
        
        if not user:
            # Create new user
            user = await self.create_user(
                email=oauth_data["email"],
                full_name=oauth_data["full_name"],
                oauth_provider=provider,
                oauth_id=oauth_data["oauth_id"],
                is_verified=oauth_data["is_verified"],
                db=db
            )
        else:
            # Update existing user
            user.full_name = oauth_data["full_name"] or user.full_name
            user.is_verified = oauth_data["is_verified"]
            user.last_login = datetime.utcnow()
            db.commit()
        
        return user
    
    async def create_user_token(self, user: User, db: Session) -> Dict[str, Any]:
        """
        Create JWT token for user
        """
        # Create session
        session = UserSession(
            user_id=user.id,
            session_token=str(uuid.uuid4()),
            expires_at=datetime.utcnow() + timedelta(hours=24)
        )
        db.add(session)
        db.commit()
        
        # Create JWT token
        access_token_expires = timedelta(minutes=30)
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email},
            expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "expires_in": 30 * 60,  # 30 minutes in seconds
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "is_active": user.is_active,
                "is_verified": user.is_verified,
                "subscription_status": user.subscription_status,
                "oauth_provider": user.oauth_provider,
                "created_at": user.created_at,
                "last_login": user.last_login
            }
        }
    
    async def update_user(
        self, 
        user: User, 
        update_data: Dict[str, Any], 
        db: Session
    ) -> User:
        """
        Update user profile
        """
        for field, value in update_data.items():
            if hasattr(user, field) and value is not None:
                setattr(user, field, value)
        
        user.updated_at = datetime.utcnow()
        db.commit()
        return user
    
    async def record_usage(
        self, 
        user: User, 
        session_duration: float, 
        session_type: str = "binaural",
        session_metadata: Optional[Dict[str, Any]] = None,
        db: Session = None
    ) -> UsageRecord:
        """
        Record user session usage
        """
        now = datetime.utcnow()
        session_start = now - timedelta(minutes=session_duration)
        
        usage_record = UsageRecord(
            user_id=user.id,
            session_duration=session_duration,
            session_type=session_type,
            session_start=session_start,
            session_end=now,
            year=now.year,
            month=now.month
        )
        
        # Add session metadata
        if session_metadata:
            usage_record.frequency_left = session_metadata.get("frequency_left")
            usage_record.frequency_right = session_metadata.get("frequency_right")
            usage_record.beat_frequency = session_metadata.get("beat_frequency")
            usage_record.pattern_used = session_metadata.get("pattern_used")
        
        db.add(usage_record)
        db.commit()
        
        logger.info(f"Recorded usage for user {user.id}: {session_duration} minutes")
        return usage_record
    
    async def get_user_by_email(self, email: str, db: Session) -> Optional[User]:
        """
        Get user by email address
        """
        return db.query(User).filter(User.email == email).first()
    
    async def get_user_by_id(self, user_id: str, db: Session) -> Optional[User]:
        """
        Get user by ID
        """
        return db.query(User).filter(User.id == user_id).first()
    
    async def deactivate_user(self, user: User, db: Session) -> User:
        """
        Deactivate user account
        """
        user.is_active = False
        user.updated_at = datetime.utcnow()
        
        # Cancel any active subscriptions
        if user.subscription_status == "premium":
            try:
                # Get active subscription
                from database.models import Subscription
                subscription = db.query(Subscription).filter(
                    Subscription.user_id == user.id,
                    Subscription.status == "active"
                ).first()
                
                if subscription:
                    await self.stripe_service.cancel_subscription(subscription.stripe_subscription_id)
                    
            except Exception as e:
                logger.error(f"Failed to cancel subscription for user {user.id}: {e}")
        
        db.commit()
        return user
    
    async def reactivate_user(self, user: User, db: Session) -> User:
        """
        Reactivate user account
        """
        user.is_active = True
        user.updated_at = datetime.utcnow()
        db.commit()
        return user