"""
Authentication routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User
from schemas.auth_schemas import (
    UserRegistration, UserLogin, UserResponse, Token, 
    OAuthStart, OAuthCallback, PasswordReset, PasswordResetConfirm,
    UserUpdate, UsageStats, SessionStart, SessionEnd
)
from services.user_service import UserService
from auth.dependencies import get_current_user, get_user_usage_stats, check_usage_limits
from auth.oauth import OAuthProvider, get_oauth_redirect_uri
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()
user_service = UserService()
oauth_provider = OAuthProvider()

@router.post("/register", response_model=Token)
async def register_user(
    user_data: UserRegistration,
    db: Session = Depends(get_db)
):
    """
    Register a new user account
    """
    try:
        # Create user
        user = await user_service.create_user(
            email=user_data.email,
            password=user_data.password,
            full_name=user_data.full_name,
            db=db
        )
        
        # Create token
        token_data = await user_service.create_user_token(user, db)
        
        return token_data
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed"
        )

@router.post("/login", response_model=Token)
async def login_user(
    user_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login with email and password
    """
    user = await user_service.authenticate_user(
        user_data.email, 
        user_data.password, 
        db
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is deactivated"
        )
    
    # Create token
    token_data = await user_service.create_user_token(user, db)
    return token_data

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current user information
    """
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile
    """
    # Check if email is being changed and if it already exists
    if user_update.email and user_update.email != current_user.email:
        existing_user = await user_service.get_user_by_email(user_update.email, db)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use"
            )
    
    updated_user = await user_service.update_user(
        current_user, 
        user_update.dict(exclude_unset=True), 
        db
    )
    
    return updated_user

@router.get("/usage", response_model=UsageStats)
async def get_usage_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user usage statistics
    """
    stats = get_user_usage_stats(current_user, db)
    return stats

@router.post("/session/start")
async def start_session(
    session_data: SessionStart,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Start a user session (check usage limits)
    """
    # For free users, check usage limits (assume 30 min session estimate)
    estimated_duration = 30  # minutes
    if not check_usage_limits(current_user, estimated_duration, db):
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Free tier usage limit exceeded. Please upgrade to premium."
        )
    
    return {
        "status": "started",
        "session_type": session_data.session_type,
        "user_id": current_user.id
    }

@router.post("/session/end")
async def end_session(
    session_data: SessionEnd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    End a user session and record usage
    """
    # Record usage
    usage_record = await user_service.record_usage(
        user=current_user,
        session_duration=session_data.session_duration,
        session_metadata=session_data.session_metadata,
        db=db
    )
    
    return {
        "status": "ended",
        "duration": session_data.session_duration,
        "usage_id": usage_record.id
    }

# OAuth Routes
@router.get("/oauth/{provider}")
async def oauth_login(
    provider: str,
    request: Request,
    response: Response
):
    """
    Start OAuth login flow
    """
    if provider not in ['google', 'facebook', 'github']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OAuth provider"
        )
    
    # Get base URL from request
    base_url = f"{request.url.scheme}://{request.url.netloc}"
    redirect_uri = get_oauth_redirect_uri(provider, base_url)
    
    # Get authorization URL
    try:
        authorization_url = await oauth_provider.get_authorization_url(provider, redirect_uri)
        
        # Store state in session or database for security
        # For now, we'll redirect directly
        response.headers["Location"] = authorization_url
        response.status_code = status.HTTP_302_FOUND
        
        return {"authorization_url": authorization_url}
        
    except Exception as e:
        logger.error(f"OAuth start error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OAuth initialization failed"
        )

@router.get("/oauth/{provider}/callback", response_model=Token)
async def oauth_callback(
    provider: str,
    code: str,
    state: str = None,
    request: Request = None,
    db: Session = Depends(get_db)
):
    """
    Handle OAuth callback
    """
    if provider not in ['google', 'facebook', 'github']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OAuth provider"
        )
    
    try:
        # Get base URL from request
        base_url = f"{request.url.scheme}://{request.url.netloc}"
        redirect_uri = get_oauth_redirect_uri(provider, base_url)
        
        # Exchange code for token
        token = await oauth_provider.exchange_code_for_token(provider, code, redirect_uri)
        
        # Get user info
        user_info = await oauth_provider.get_user_info(provider, token)
        
        # Authenticate or create user
        user = await user_service.authenticate_oauth_user(provider, user_info, db)
        
        # Create JWT token
        token_data = await user_service.create_user_token(user, db)
        
        return token_data
        
    except Exception as e:
        logger.error(f"OAuth callback error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OAuth authentication failed"
        )

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Logout user (invalidate token)
    """
    # In a more complete implementation, you'd invalidate the JWT token
    # For now, just return success
    return {"message": "Logged out successfully"}

@router.post("/password-reset")
async def request_password_reset(
    reset_data: PasswordReset,
    db: Session = Depends(get_db)
):
    """
    Request password reset (send email)
    """
    user = await user_service.get_user_by_email(reset_data.email, db)
    
    # Always return success to prevent email enumeration
    # In production, send email if user exists
    if user:
        # TODO: Implement email sending with reset token
        logger.info(f"Password reset requested for {reset_data.email}")
    
    return {"message": "If the email exists, a password reset link has been sent"}

@router.post("/password-reset/confirm")
async def confirm_password_reset(
    reset_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    Confirm password reset with token
    """
    # TODO: Implement token validation and password reset
    # This is a placeholder implementation
    
    return {"message": "Password reset successfully"}

@router.delete("/account")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete user account
    """
    try:
        await user_service.deactivate_user(current_user, db)
        return {"message": "Account deactivated successfully"}
    except Exception as e:
        logger.error(f"Account deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate account"
        )