#!/usr/bin/env python3
"""
Test timer endpoints with authentication
"""

import requests
import json
import jwt
from datetime import datetime, timedelta, UTC

BASE_URL = "http://localhost:8001"

def create_test_token():
    """Create a test JWT token for testing"""
    payload = {
        "iss": "test-issuer",
        "sub": "test-user@example.com", 
        "aud": "ebl-app",
        "exp": datetime.now(UTC) + timedelta(hours=1),
        "email": "test-user@example.com",
        "name": "Test User"
    }
    return jwt.encode(payload, "fake-secret", algorithm="HS256")

def test_authenticated_endpoints():
    """Test authenticated timer endpoints"""
    token = create_test_token()
    headers = {"Authorization": f"Bearer {token}"}
    
    print("Timer Authentication Testing")
    print("=" * 50)
    
    # Test presets endpoint (requires auth)
    print("\n=== Testing /api/timer/presets ===")
    try:
        response = requests.get(f"{BASE_URL}/api/timer/presets", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 401:
            print("Expected - Authentication required")
            print("Response:", response.json())
        else:
            print("Response:", response.json())
    except Exception as e:
        print(f"Error: {e}")
    
    # Test without auth (should get 401)
    print("\n=== Testing /api/timer/presets (no auth) ===")
    try:
        response = requests.get(f"{BASE_URL}/api/timer/presets")
        print(f"Status: {response.status_code}")
        print("Response:", response.json())
    except Exception as e:
        print(f"Error: {e}")

    # Test status endpoint
    print("\n=== Testing /api/timer/status ===")
    try:
        response = requests.get(f"{BASE_URL}/api/timer/status", headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 401:
            print("Expected - Authentication required")
            print("Response:", response.json())
        else:
            print("Response:", response.json())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_authenticated_endpoints()
