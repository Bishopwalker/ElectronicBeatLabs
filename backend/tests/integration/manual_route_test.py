#!/usr/bin/env python3
"""
Direct route testing script to verify timer endpoints are working
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

def test_endpoint(endpoint, method="GET", headers=None, data=None):
    """Test a single endpoint"""
    url = f"{BASE_URL}{endpoint}"
    print(f"\n=== Testing {method} {endpoint} ===")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data)
        
        print(f"Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type', 'unknown')}")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            print("Response:")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"Raw response: {response.text[:200]}...")
            
    except Exception as e:
        print(f"ERROR: {e}")

def main():
    print("Timer Route Testing Script")
    print("=" * 50)
    
    # Test basic health
    test_endpoint("/health")
    
    # Test root endpoint
    test_endpoint("/")
    
    # Test timer endpoints that don't need auth
    test_endpoint("/api/timer/subscription-benefits")
    
    # Test with basic auth header (will fail but should show proper error)
    headers = {"Authorization": "Bearer fake-token"}
    test_endpoint("/api/timer/presets", headers=headers)
    
    print("\n" + "=" * 50)
    print("Testing complete")

if __name__ == "__main__":
    main()