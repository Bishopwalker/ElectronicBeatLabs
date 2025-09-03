#!/usr/bin/env python3
"""
Simple tests for authentication and subscription system
"""

import pytest
import tempfile
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database.database import Base, get_db
from backend.database.models import User, UsageRecord, WebhookEvent
from backend.routes.simple_routes import router
from fastapi import FastAPI

# Create test app
app = FastAPI()
app.include_router(router, prefix="/api")

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture
def setup_db():
    """Setup test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

def test_anonymous_usage_tracking(setup_db):
    """Test anonymous usage tracking by IP"""
    client = TestClient(app)
    
    # Record anonymous usage
    response = client.post("/api/usage/anonymous", json={
        "minutes": 30.0
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "recorded"
    assert data["minutes"] == 30.0
    assert "ip" in data  # Should return IP address
    
    # Check anonymous usage
    response = client.get("/api/usage/check")
    assert response.status_code == 200
    
    usage = response.json()
    assert usage["used_minutes"] == 30.0
    assert usage["limit_minutes"] == 180  # 3 hours
    assert usage["remaining_minutes"] == 150
    assert usage["can_use"] is True
    assert usage["requires_login"] is False  # Still within limit

def test_anonymous_usage_limits(setup_db):
    """Test anonymous free tier usage limits"""
    client = TestClient(app)
    
    # Record usage that exceeds limit
    response = client.post("/api/usage/anonymous", json={
        "minutes": 200.0  # More than 180 minute limit
    })
    
    assert response.status_code == 200
    
    # Check usage - should require login
    response = client.get("/api/usage/check")
    assert response.status_code == 200
    
    usage = response.json()
    assert usage["used_minutes"] == 200.0
    assert usage["can_use"] is False  # Should not be able to use more
    assert usage["requires_login"] is True  # Should require login
    assert usage["remaining_minutes"] == 0

def test_user_usage_tracking(setup_db):
    """Test usage tracking for logged in users"""
    client = TestClient(app)
    
    # Record user usage
    response = client.post("/api/usage/user", json={
        "email": "user@example.com",
        "minutes": 45.0
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "recorded"
    assert data["minutes"] == 45.0
    assert data["email"] == "user@example.com"
    
    # Check user usage
    response = client.get("/api/usage/user@example.com")
    assert response.status_code == 200
    
    usage = response.json()
    assert usage["used_minutes"] == 45.0
    assert usage["can_use"] is True
    assert usage["requires_login"] is False  # Already logged in

def test_subscription_plans():
    """Test getting subscription plans"""
    client = TestClient(app)
    
    response = client.get("/api/subscription/plans")
    assert response.status_code == 200
    
    data = response.json()
    assert "premium" in data
    assert data["premium"]["price"] == 399  # $3.99
    assert data["premium"]["currency"] == "usd"
    assert "free" in data

def test_webhook_event_logging(setup_db):
    """Test webhook event logging"""
    from backend.database.models import WebhookEvent
    
    db = TestingSessionLocal()
    
    # Create a webhook event
    event = WebhookEvent(
        stripe_event_id="evt_test_123",
        event_type="customer.subscription.created",
        data='{"test": "data"}',
        processed=False
    )
    
    db.add(event)
    db.commit()
    
    # Verify it was saved
    saved_event = db.query(WebhookEvent).filter(
        WebhookEvent.stripe_event_id == "evt_test_123"
    ).first()
    
    assert saved_event is not None
    assert saved_event.event_type == "customer.subscription.created"
    assert saved_event.processed is False
    
    db.close()

def test_user_creation(setup_db):
    """Test user model creation"""
    from backend.database.models import User
    
    db = TestingSessionLocal()
    
    # Create a user
    user = User(
        email="testuser@example.com",
        oauth_provider="google",
        is_premium=False,
        stripe_customer_id="cus_test123"
    )
    
    db.add(user)
    db.commit()
    
    # Verify user was saved
    saved_user = db.query(User).filter(User.email == "testuser@example.com").first()
    
    assert saved_user is not None
    assert saved_user.oauth_provider == "google"
    assert saved_user.is_premium is False
    assert saved_user.stripe_customer_id == "cus_test123"
    
    db.close()

if __name__ == "__main__":
    # Run tests manually
    import sys
    
    # Setup test database
    Base.metadata.create_all(bind=engine)
    
    def clean_database():
        """Clean all data from database tables"""
        db = TestingSessionLocal()
        try:
            # Delete all records from all tables
            db.query(UsageRecord).delete()
            db.query(WebhookEvent).delete() 
            db.query(User).delete()
            db.commit()
        finally:
            db.close()

    try:
        print("Testing anonymous usage tracking...")
        clean_database()
        test_anonymous_usage_tracking(None)
        print("PASS: Anonymous usage tracking test")
        
        print("Testing usage limits...")
        clean_database()
        test_anonymous_usage_limits(None)
        print("PASS: Usage limits test")
        
        print("Testing user usage tracking...")
        clean_database()
        test_user_usage_tracking(None)
        print("PASS: User usage tracking test")
        
        print("Testing subscription plans...")
        test_subscription_plans()
        print("PASS: Subscription plans test")
        
        print("Testing webhook logging...")
        test_webhook_event_logging(None)
        print("PASS: Webhook logging test")
        
        print("Testing user creation...")
        test_user_creation(None)
        print("PASS: User creation test")
        
        print("\nALL TESTS PASSED!")
        
    except Exception as e:
        print(f"FAIL: Test failed: {e}")
        sys.exit(1)
    finally:
        # Cleanup
        Base.metadata.drop_all(bind=engine)
        if os.path.exists("test.db"):
            try:
                os.remove("test.db")
            except PermissionError:
                print("Warning: Could not remove test.db (file in use)")
                pass