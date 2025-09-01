"""
Simple authentication and subscription routes
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from database.database import get_db
from services.simple_auth import SimpleAuthService
from pydantic import BaseModel
import stripe
import os

# Setup
router = APIRouter()
auth_service = SimpleAuthService()
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

# Request models
class OAuthLogin(BaseModel):
    token: str
    provider: str  # "google", "github", "facebook"

class UsageRecordAnonymous(BaseModel):
    minutes: float

class UsageRecordUser(BaseModel):
    email: str
    minutes: float

# Auth routes
@router.post("/auth/oauth")
async def oauth_login(login_data: OAuthLogin, db: Session = Depends(get_db)):
    """Login with OAuth token"""
    
    # Verify token based on provider
    user_info = None
    if login_data.provider == "google":
        user_info = await auth_service.verify_google_token(login_data.token)
    elif login_data.provider == "github":
        user_info = await auth_service.verify_github_token(login_data.token)
    else:
        raise HTTPException(status_code=400, detail="Unsupported OAuth provider")
    
    if not user_info or not user_info["email"]:
        raise HTTPException(status_code=401, detail="Invalid OAuth token")
    
    # Get or create user
    user = await auth_service.get_or_create_user(
        email=user_info["email"],
        provider=login_data.provider,
        db=db
    )
    
    return {
        "email": user.email,
        "is_premium": user.is_premium,
        "oauth_provider": user.oauth_provider,
        "stripe_customer_id": user.stripe_customer_id
    }

@router.get("/usage/check")
async def check_usage_anonymous(request: Request, db: Session = Depends(get_db)):
    """Check usage limits for current IP address (anonymous)"""
    client_ip = request.client.host
    usage_info = auth_service.check_usage_limit_by_ip(client_ip, db)
    return usage_info

@router.get("/usage/{email}")
async def check_usage_user(email: str, db: Session = Depends(get_db)):
    """Check usage limits for logged in user"""
    usage_info = auth_service.check_usage_limit_by_email(email, db)
    return usage_info

@router.post("/usage/anonymous")
async def record_anonymous_usage(
    usage_data: UsageRecordAnonymous, 
    request: Request,
    db: Session = Depends(get_db)
):
    """Record usage for anonymous session (IP-based)"""
    client_ip = request.client.host
    auth_service.record_usage_by_ip(client_ip, usage_data.minutes, db)
    return {
        "status": "recorded", 
        "minutes": usage_data.minutes,
        "ip": client_ip
    }

@router.post("/usage/user")
async def record_user_usage(
    usage_data: UsageRecordUser, 
    request: Request,
    db: Session = Depends(get_db)
):
    """Record usage for logged in user"""
    client_ip = request.client.host
    auth_service.record_usage_by_email(usage_data.email, client_ip, usage_data.minutes, db)
    return {
        "status": "recorded", 
        "minutes": usage_data.minutes,
        "email": usage_data.email
    }

# Subscription routes
@router.get("/subscription/plans")
async def get_plans():
    """Get available subscription plans"""
    return {
        "premium": {
            "price": 399,  # $3.99 in cents
            "currency": "usd",
            "interval": "month",
            "features": ["Unlimited usage", "Advanced patterns", "Priority support"]
        },
        "free": {
            "price": 0,
            "features": ["3 hours per month", "Basic patterns"]
        }
    }

@router.post("/subscription/create-payment-intent")
async def create_payment_intent(request: dict, db: Session = Depends(get_db)):
    """Create Stripe payment intent for subscription"""
    
    email = request.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email required")
    
    # Get user
    from database.models import User
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.stripe_customer_id:
        raise HTTPException(status_code=400, detail="User not found or no Stripe customer")
    
    # Create payment intent
    try:
        intent = stripe.PaymentIntent.create(
            amount=399,  # $3.99
            currency='usd',
            customer=user.stripe_customer_id,
            metadata={'email': email, 'plan': 'premium'}
        )
        
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment intent creation failed: {str(e)}")

@router.post("/subscription/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhooks"""
    
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    try:
        # Verify webhook signature
        endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        
        # Log the event
        from database.models import WebhookEvent
        webhook_log = WebhookEvent(
            stripe_event_id=event['id'],
            event_type=event['type'],
            data=str(event['data']),
            processed=False
        )
        db.add(webhook_log)
        
        # Handle subscription events
        if event['type'] == 'customer.subscription.created':
            # User subscribed - mark as premium
            customer_id = event['data']['object']['customer']
            
            from database.models import User
            user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
            if user:
                user.is_premium = True
                webhook_log.processed = True
                
        elif event['type'] == 'customer.subscription.deleted':
            # User cancelled - remove premium
            customer_id = event['data']['object']['customer']
            
            from database.models import User
            user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
            if user:
                user.is_premium = False
                webhook_log.processed = True
        
        db.commit()
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook processing failed: {str(e)}")

@router.get("/subscription/status/{email}")
async def get_subscription_status(email: str, db: Session = Depends(get_db)):
    """Get user's subscription status"""
    
    from database.models import User
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "email": user.email,
        "is_premium": user.is_premium,
        "has_stripe_customer": user.stripe_customer_id is not None
    }