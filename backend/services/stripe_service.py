"""
Stripe integration service for subscription management
"""

import stripe
import os
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from database.models import User, Subscription, PaymentRecord
from datetime import datetime
import logging

load_dotenv()

# Configure Stripe
stripe.api_key = os.getenv("STRIPE_API_KEY")

logger = logging.getLogger(__name__)

class StripeService:
    """
    Service class for Stripe operations
    """
    
    def __init__(self):
        self.webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        self.premium_price = int(os.getenv("PREMIUM_PRICE", 399))  # $3.99 in cents
    
    async def create_customer(self, user: User) -> str:
        """
        Create a Stripe customer for a user
        """
        try:
            customer = stripe.Customer.create(
                email=user.email,
                name=user.full_name,
                metadata={
                    "user_id": user.id,
                    "app": "electromagnetic_beat_lab"
                }
            )
            return customer.id
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create Stripe customer: {e}")
            raise Exception(f"Failed to create customer: {str(e)}")
    
    async def create_subscription(
        self, 
        customer_id: str, 
        price_id: str, 
        payment_method_id: Optional[str] = None,
        trial_days: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Create a Stripe subscription
        """
        try:
            subscription_params = {
                "customer": customer_id,
                "items": [{"price": price_id}],
                "expand": ["latest_invoice.payment_intent"],
                "metadata": {
                    "app": "electromagnetic_beat_lab"
                }
            }
            
            if payment_method_id:
                subscription_params["default_payment_method"] = payment_method_id
            
            if trial_days:
                subscription_params["trial_period_days"] = trial_days
            
            subscription = stripe.Subscription.create(**subscription_params)
            return subscription
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create subscription: {e}")
            raise Exception(f"Failed to create subscription: {str(e)}")
    
    async def cancel_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """
        Cancel a Stripe subscription
        """
        try:
            subscription = stripe.Subscription.cancel(subscription_id)
            return subscription
        except stripe.error.StripeError as e:
            logger.error(f"Failed to cancel subscription: {e}")
            raise Exception(f"Failed to cancel subscription: {str(e)}")
    
    async def update_subscription(
        self, 
        subscription_id: str, 
        **kwargs
    ) -> Dict[str, Any]:
        """
        Update a Stripe subscription
        """
        try:
            subscription = stripe.Subscription.modify(subscription_id, **kwargs)
            return subscription
        except stripe.error.StripeError as e:
            logger.error(f"Failed to update subscription: {e}")
            raise Exception(f"Failed to update subscription: {str(e)}")
    
    async def create_payment_intent(
        self, 
        amount: int, 
        currency: str = "usd",
        customer_id: Optional[str] = None,
        metadata: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Create a Stripe payment intent
        """
        try:
            payment_intent_params = {
                "amount": amount,
                "currency": currency,
                "automatic_payment_methods": {"enabled": True},
            }
            
            if customer_id:
                payment_intent_params["customer"] = customer_id
            
            if metadata:
                payment_intent_params["metadata"] = metadata
            
            payment_intent = stripe.PaymentIntent.create(**payment_intent_params)
            return payment_intent
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create payment intent: {e}")
            raise Exception(f"Failed to create payment intent: {str(e)}")
    
    async def create_setup_intent(self, customer_id: str) -> Dict[str, Any]:
        """
        Create a Stripe setup intent for saving payment methods
        """
        try:
            setup_intent = stripe.SetupIntent.create(
                customer=customer_id,
                usage="off_session"
            )
            return setup_intent
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create setup intent: {e}")
            raise Exception(f"Failed to create setup intent: {str(e)}")
    
    async def get_customer_payment_methods(self, customer_id: str) -> List[Dict[str, Any]]:
        """
        Get customer's saved payment methods
        """
        try:
            payment_methods = stripe.PaymentMethod.list(
                customer=customer_id,
                type="card"
            )
            return payment_methods.data
        except stripe.error.StripeError as e:
            logger.error(f"Failed to get payment methods: {e}")
            return []
    
    async def create_portal_session(
        self, 
        customer_id: str, 
        return_url: str
    ) -> Dict[str, Any]:
        """
        Create a Stripe customer portal session
        """
        try:
            portal_session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url
            )
            return portal_session
        except stripe.error.StripeError as e:
            logger.error(f"Failed to create portal session: {e}")
            raise Exception(f"Failed to create portal session: {str(e)}")
    
    def construct_webhook_event(self, payload: bytes, sig_header: str) -> Dict[str, Any]:
        """
        Construct and verify Stripe webhook event
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, self.webhook_secret
            )
            return event
        except ValueError as e:
            logger.error(f"Invalid payload: {e}")
            raise Exception("Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {e}")
            raise Exception("Invalid signature")
    
    async def handle_webhook_event(
        self, 
        event: Dict[str, Any], 
        db: Session
    ) -> Dict[str, Any]:
        """
        Handle Stripe webhook events
        """
        event_type = event['type']
        data = event['data']['object']
        
        logger.info(f"Processing webhook event: {event_type}")
        
        try:
            if event_type == 'customer.subscription.created':
                await self._handle_subscription_created(data, db)
            elif event_type == 'customer.subscription.updated':
                await self._handle_subscription_updated(data, db)
            elif event_type == 'customer.subscription.deleted':
                await self._handle_subscription_deleted(data, db)
            elif event_type == 'invoice.payment_succeeded':
                await self._handle_payment_succeeded(data, db)
            elif event_type == 'invoice.payment_failed':
                await self._handle_payment_failed(data, db)
            else:
                logger.info(f"Unhandled event type: {event_type}")
            
            return {"status": "success", "event_type": event_type}
        except Exception as e:
            logger.error(f"Error handling webhook event {event_type}: {e}")
            raise
    
    async def _handle_subscription_created(self, data: Dict[str, Any], db: Session):
        """
        Handle subscription created event
        """
        customer_id = data['customer']
        subscription_id = data['id']
        
        # Find user by Stripe customer ID
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if not user:
            logger.error(f"User not found for customer {customer_id}")
            return
        
        # Create subscription record
        subscription = Subscription(
            user_id=user.id,
            stripe_subscription_id=subscription_id,
            stripe_customer_id=customer_id,
            status=data['status'],
            amount=data['items']['data'][0]['price']['unit_amount'],
            current_period_start=datetime.fromtimestamp(data['current_period_start']),
            current_period_end=datetime.fromtimestamp(data['current_period_end'])
        )
        
        db.add(subscription)
        
        # Update user subscription status
        user.subscription_status = "premium"
        db.commit()
        
        logger.info(f"Subscription created for user {user.id}")
    
    async def _handle_subscription_updated(self, data: Dict[str, Any], db: Session):
        """
        Handle subscription updated event
        """
        subscription_id = data['id']
        
        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_id
        ).first()
        
        if subscription:
            subscription.status = data['status']
            subscription.current_period_start = datetime.fromtimestamp(data['current_period_start'])
            subscription.current_period_end = datetime.fromtimestamp(data['current_period_end'])
            
            if data.get('canceled_at'):
                subscription.cancelled_at = datetime.fromtimestamp(data['canceled_at'])
            
            db.commit()
            logger.info(f"Subscription {subscription_id} updated")
    
    async def _handle_subscription_deleted(self, data: Dict[str, Any], db: Session):
        """
        Handle subscription deleted event
        """
        subscription_id = data['id']
        
        subscription = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == subscription_id
        ).first()
        
        if subscription:
            subscription.status = "cancelled"
            subscription.cancelled_at = datetime.fromtimestamp(data['canceled_at'])
            
            # Update user subscription status
            user = db.query(User).filter(User.id == subscription.user_id).first()
            if user:
                user.subscription_status = "free"
            
            db.commit()
            logger.info(f"Subscription {subscription_id} cancelled")
    
    async def _handle_payment_succeeded(self, data: Dict[str, Any], db: Session):
        """
        Handle payment succeeded event
        """
        customer_id = data['customer']
        
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if not user:
            return
        
        # Create payment record
        payment_record = PaymentRecord(
            user_id=user.id,
            stripe_payment_intent_id=data.get('payment_intent', ''),
            amount=data['amount_paid'],
            currency=data['currency'],
            status="succeeded",
            description=f"Payment for {data.get('description', 'Subscription')}"
        )
        
        db.add(payment_record)
        db.commit()
        
        logger.info(f"Payment succeeded for user {user.id}")
    
    async def _handle_payment_failed(self, data: Dict[str, Any], db: Session):
        """
        Handle payment failed event
        """
        customer_id = data['customer']
        
        user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
        if not user:
            return
        
        logger.warning(f"Payment failed for user {user.id}")
        
        # You might want to send an email notification here
        # or update the user's subscription status