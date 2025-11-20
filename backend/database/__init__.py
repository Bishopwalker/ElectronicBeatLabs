"""
Database configuration and models for Electromagnetic Beat Lab

This package contains SQLAlchemy models, database configuration,
and session management for user data, subscriptions, and payments.
"""

from database.base import Base
from database.database import engine, SessionLocal, get_db, init_db
from database.models import (
    User,
    Subscription,
    PaymentRecord,
    UsageRecord,
    WebhookEvent
)

__all__ = [
    # Base declarative class
    'Base',
    # Database engine and session
    'engine',
    'SessionLocal',
    'get_db',
    'init_db',
    # Models
    'User',
    'Subscription',
    'PaymentRecord',
    'UsageRecord',
    'WebhookEvent'
]