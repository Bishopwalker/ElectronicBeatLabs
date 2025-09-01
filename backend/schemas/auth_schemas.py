"""
Authentication and user management schemas
"""

from pydantic import BaseModel, EmailStr, validator
from typing import Optional, Dict, Any, List
from datetime import datetime
import re


class UserRegistration(BaseModel):
    """
    User registration schema
    """
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v


class UserLogin(BaseModel):
    """
    User login schema
    """
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """
    User response schema
    """
    id: str
    email: str
    full_name: Optional[str] = None
    is_active: bool
    is_verified: bool
    subscription_status: str
    oauth_provider: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """
    JWT token response
    """
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class TokenData(BaseModel):
    """
    Token data schema
    """
    user_id: Optional[str] = None
    email: Optional[str] = None


class OAuthStart(BaseModel):
    """
    OAuth flow start request
    """
    provider: str
    redirect_uri: Optional[str] = None
    
    @validator('provider')
    def validate_provider(cls, v):
        if v not in ['google', 'facebook', 'github']:
            raise ValueError('Invalid OAuth provider')
        return v


class OAuthCallback(BaseModel):
    """
    OAuth callback data
    """
    code: str
    state: Optional[str] = None


class PasswordReset(BaseModel):
    """
    Password reset request
    """
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """
    Password reset confirmation
    """
    token: str
    new_password: str
    
    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v


class UserUpdate(BaseModel):
    """
    User profile update schema
    """
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None


class UsageStats(BaseModel):
    """
    User usage statistics
    """
    current_month_minutes: float
    current_month_hours: float
    free_tier_minutes: float
    free_tier_hours: float
    remaining_minutes: float
    remaining_hours: float
    total_minutes: float
    total_hours: float
    total_sessions: int
    subscription_status: str
    usage_percentage: float


class SessionStart(BaseModel):
    """
    Session start request
    """
    session_type: str = "binaural"
    frequency_left: Optional[float] = None
    frequency_right: Optional[float] = None
    beat_frequency: Optional[float] = None
    pattern_used: Optional[str] = None


class SessionEnd(BaseModel):
    """
    Session end request
    """
    session_duration: float  # Duration in minutes
    session_metadata: Optional[Dict[str, Any]] = None


class SubscriptionInfo(BaseModel):
    """
    Subscription information
    """
    id: str
    status: str
    plan_type: str
    billing_cycle: str
    amount: int
    currency: str
    current_period_start: datetime
    current_period_end: datetime
    cancelled_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class CreateSubscription(BaseModel):
    """
    Create subscription request
    """
    price_id: str
    payment_method_id: Optional[str] = None


class WebhookEvent(BaseModel):
    """
    Webhook event schema
    """
    id: str
    type: str
    data: Dict[str, Any]