"""
Subscription and payment routes
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User, Subscription
from schemas.auth_schemas import CreateSubscription, SubscriptionInfo
from services.stripe_service import StripeService
from auth.dependencies import get_current_user
from typing import Dict, Any, List
import logging
import json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/subscription", tags=["Subscription"])
stripe_service = StripeService()

@router.get("/plans")
async def get_subscription_plans():
    """
    Get available subscription plans
    """
    return {
        "plans": [
            {
                "id": "premium",
                "name": "Premium",
                "price": 399,  # $3.99 in cents
                "currency": "usd",
                "interval": "month",
                "features": [
                    "Unlimited usage",
                    "Advanced binaural patterns",
                    "ADHD treatment protocols",
                    "8D spatial audio",
                    "Progress tracking",
                    "Priority support"
                ]
            }
        ],
        "free_plan": {
            "id": "free",
            "name": "Free",
            "price": 0,
            "features": [
                "3 hours per month",
                "Basic binaural patterns",
                "Limited features"
            ]
        }
    }

@router.get("/status")
async def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get user's current subscription status
    """
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status.in_(["active", "trialing", "past_due"])
    ).first()
    
    if subscription:
        return {
            "has_subscription": True,
            "status": subscription.status,
            "plan_type": subscription.plan_type,
            "current_period_end": subscription.current_period_end,
            "cancel_at_period_end": subscription.cancelled_at is not None
        }
    
    return {
        "has_subscription": False,
        "status": "free",
        "plan_type": "free"
    }

@router.post("/create-payment-intent")
async def create_payment_intent(
    current_user: User = Depends(get_current_user)
):
    """
    Create a payment intent for subscription
    """
    try:
        if not current_user.stripe_customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stripe customer not found"
            )
        
        payment_intent = await stripe_service.create_payment_intent(
            amount=stripe_service.premium_price,
            customer_id=current_user.stripe_customer_id,
            metadata={
                "user_id": current_user.id,
                "plan": "premium"
            }
        )
        
        return {
            "client_secret": payment_intent.client_secret,
            "payment_intent_id": payment_intent.id
        }
        
    except Exception as e:
        logger.error(f"Failed to create payment intent: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment intent"
        )

@router.post("/create-setup-intent")
async def create_setup_intent(
    current_user: User = Depends(get_current_user)
):
    """
    Create a setup intent for saving payment methods
    """
    try:
        if not current_user.stripe_customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stripe customer not found"
            )
        
        setup_intent = await stripe_service.create_setup_intent(
            current_user.stripe_customer_id
        )
        
        return {
            "client_secret": setup_intent.client_secret,
            "setup_intent_id": setup_intent.id
        }
        
    except Exception as e:
        logger.error(f"Failed to create setup intent: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create setup intent"
        )

@router.post("/subscribe")
async def create_subscription(
    subscription_data: CreateSubscription,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new subscription
    """
    try:
        if not current_user.stripe_customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stripe customer not found"
            )
        
        # Check if user already has an active subscription
        existing_subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id,
            Subscription.status.in_(["active", "trialing"])
        ).first()
        
        if existing_subscription:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has an active subscription"
            )
        
        # Create Stripe subscription
        stripe_subscription = await stripe_service.create_subscription(
            customer_id=current_user.stripe_customer_id,
            price_id=subscription_data.price_id,
            payment_method_id=subscription_data.payment_method_id
        )
        
        return {
            "subscription_id": stripe_subscription.id,
            "status": stripe_subscription.status,
            "client_secret": stripe_subscription.latest_invoice.payment_intent.client_secret
        }
        
    except Exception as e:
        logger.error(f"Failed to create subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create subscription: {str(e)}"
        )

@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel user's subscription
    """
    try:
        subscription = db.query(Subscription).filter(
            Subscription.user_id == current_user.id,
            Subscription.status.in_(["active", "trialing"])
        ).first()
        
        if not subscription:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active subscription found"
            )
        
        # Cancel Stripe subscription
        cancelled_subscription = await stripe_service.cancel_subscription(
            subscription.stripe_subscription_id
        )
        
        return {
            "status": "cancelled",
            "cancelled_at": cancelled_subscription.canceled_at,
            "current_period_end": cancelled_subscription.current_period_end
        }
        
    except Exception as e:
        logger.error(f"Failed to cancel subscription: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel subscription"
        )

@router.get("/payment-methods")
async def get_payment_methods(
    current_user: User = Depends(get_current_user)
):
    """
    Get user's saved payment methods
    """
    try:
        if not current_user.stripe_customer_id:
            return {"payment_methods": []}
        
        payment_methods = await stripe_service.get_customer_payment_methods(
            current_user.stripe_customer_id
        )
        
        return {
            "payment_methods": [
                {
                    "id": pm.id,
                    "brand": pm.card.brand if pm.card else None,
                    "last4": pm.card.last4 if pm.card else None,
                    "exp_month": pm.card.exp_month if pm.card else None,
                    "exp_year": pm.card.exp_year if pm.card else None
                }
                for pm in payment_methods
            ]
        }
        
    except Exception as e:
        logger.error(f"Failed to get payment methods: {e}")
        return {"payment_methods": []}

@router.post("/portal")
async def create_customer_portal(
    current_user: User = Depends(get_current_user),
    request: Request = None
):
    """
    Create Stripe customer portal session
    """
    try:
        if not current_user.stripe_customer_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stripe customer not found"
            )
        
        # Get return URL from request
        base_url = f"{request.url.scheme}://{request.url.netloc}"
        return_url = f"{base_url}/dashboard"  # Adjust as needed
        
        portal_session = await stripe_service.create_portal_session(
            current_user.stripe_customer_id,
            return_url
        )
        
        return {"url": portal_session.url}
        
    except Exception as e:
        logger.error(f"Failed to create portal session: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create portal session"
        )

@router.get("/invoices")
async def get_invoices(
    current_user: User = Depends(get_current_user)
):
    """
    Get user's invoices (placeholder - implement with Stripe if needed)
    """
    # TODO: Implement invoice retrieval from Stripe
    return {"invoices": []}

@router.post("/webhook", include_in_schema=False)
async def stripe_webhook(
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Handle Stripe webhooks
    """
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        if not sig_header:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Missing Stripe signature"
            )
        
        # Construct webhook event
        event = stripe_service.construct_webhook_event(payload, sig_header)
        
        # Handle the event
        result = await stripe_service.handle_webhook_event(event, db)
        
        return result
        
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhook processing failed"
        )