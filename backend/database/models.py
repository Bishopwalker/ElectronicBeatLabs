"""
Database models for Electromagnetic Beat Lab
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database.base import Base
import uuid

class User(Base):
    """
    Simple user model - just OAuth email and subscription status
    """
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=True)
    
    # OAuth provider (required - no local passwords)
    oauth_provider = Column(String, nullable=False)  # google, facebook, github, keycloak
    
    # Simple subscription tracking
    is_premium = Column(Boolean, default=False)
    stripe_customer_id = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    subscriptions = relationship("Subscription", back_populates="user")
    payments = relationship("PaymentRecord", back_populates="user")

class Subscription(Base):
    """
    Subscription tracking for premium features
    """
    __tablename__ = "subscriptions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    stripe_subscription_id = Column(String, unique=True, nullable=False)
    status = Column(String, nullable=False)  # active, canceled, past_due, etc.
    current_period_start = Column(DateTime(timezone=True), nullable=False)
    current_period_end = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    user = relationship("User", back_populates="subscriptions")

class PaymentRecord(Base):
    """
    Payment history tracking
    """
    __tablename__ = "payment_records"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    stripe_payment_intent_id = Column(String, unique=True, nullable=False)
    amount = Column(Integer, nullable=False)  # Amount in cents
    currency = Column(String, nullable=False, default="usd")
    status = Column(String, nullable=False)  # succeeded, failed, pending
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship
    user = relationship("User", back_populates="payments")

class UsageRecord(Base):
    """
    Simple usage tracking for free tier (3 hours/month limit)
    Track by IP address initially, email only after login required
    """
    __tablename__ = "usage_records"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Track by IP address for anonymous usage
    ip_address = Column(String, nullable=False, index=True)
    user_email = Column(String, nullable=True, index=True)  # Only after login
    
    # Simple session tracking
    minutes_used = Column(Float, nullable=False)
    year_month = Column(String, nullable=False, index=True)  # "2024-01"
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Simple webhook logging for Stripe events
class WebhookEvent(Base):
    """
    Just log Stripe webhook events for subscription changes
    """
    __tablename__ = "webhook_events"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    stripe_event_id = Column(String, unique=True, nullable=False)
    event_type = Column(String, nullable=False)
    processed = Column(Boolean, default=False)
    data = Column(Text, nullable=False)  # JSON data
    created_at = Column(DateTime(timezone=True), server_default=func.now())