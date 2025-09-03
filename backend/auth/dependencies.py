"""
Authentication dependencies for FastAPI
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.database.database import get_db
from backend.database.models import User, UsageRecord
from backend.auth.auth_utils import verify_token
from datetime import datetime
import calendar

# Security scheme
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token
    """
    token = credentials.credentials
    payload = verify_token(token)
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user (alias for clarity)
    """
    return current_user

async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User | None:
    """
    Get user if authenticated, None otherwise (for optional authentication)
    """
    try:
        if not credentials:
            return None
        return await get_current_user(credentials, db)
    except HTTPException:
        return None

def check_usage_limits(user: User, session_duration: float, db: Session) -> bool:
    """
    Check if user has exceeded usage limits for free tier
    Returns True if usage is allowed, False otherwise
    """
    # Premium users have unlimited usage
    if user.subscription_status == "premium":
        return True
    
    # Get current month usage
    now = datetime.utcnow()
    current_month = now.month
    current_year = now.year
    
    # Calculate total usage for current month
    usage_query = db.query(UsageRecord).filter(
        UsageRecord.user_id == user.id,
        UsageRecord.month == current_month,
        UsageRecord.year == current_year
    )
    
    total_minutes = sum(record.session_duration for record in usage_query.all())
    free_tier_minutes = 3 * 60  # 3 hours = 180 minutes
    
    # Check if adding this session would exceed the limit
    if total_minutes + session_duration > free_tier_minutes:
        return False
    
    return True

def get_user_usage_stats(user: User, db: Session) -> dict:
    """
    Get usage statistics for a user
    """
    now = datetime.utcnow()
    current_month = now.month
    current_year = now.year
    
    # Current month usage
    current_month_usage = db.query(UsageRecord).filter(
        UsageRecord.user_id == user.id,
        UsageRecord.month == current_month,
        UsageRecord.year == current_year
    ).all()
    
    current_month_minutes = sum(record.session_duration for record in current_month_usage)
    
    # All time usage
    all_usage = db.query(UsageRecord).filter(UsageRecord.user_id == user.id).all()
    total_minutes = sum(record.session_duration for record in all_usage)
    total_sessions = len(all_usage)
    
    free_tier_minutes = 3 * 60  # 3 hours
    
    return {
        "current_month_minutes": current_month_minutes,
        "current_month_hours": round(current_month_minutes / 60, 2),
        "free_tier_minutes": free_tier_minutes,
        "free_tier_hours": 3,
        "remaining_minutes": max(0, free_tier_minutes - current_month_minutes),
        "remaining_hours": max(0, round((free_tier_minutes - current_month_minutes) / 60, 2)),
        "total_minutes": total_minutes,
        "total_hours": round(total_minutes / 60, 2),
        "total_sessions": total_sessions,
        "subscription_status": user.subscription_status,
        "usage_percentage": min(100, (current_month_minutes / free_tier_minutes) * 100)
    }

async def require_premium_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Require user to have premium subscription
    """
    if current_user.subscription_status != "premium":
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Premium subscription required for this feature"
        )
    return current_user