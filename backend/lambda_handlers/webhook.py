"""
Lambda handler for Stripe webhook events
"""

import json
from mangum import Mangum
from fastapi import FastAPI
from routes.simple_routes import router as simple_router

# Create minimal FastAPI app for webhook endpoint
app = FastAPI()
app.include_router(simple_router, prefix="/api")

# Mangum adapter for AWS Lambda
adapter = Mangum(app, lifespan="off")


def handler(event, context):
    """
    AWS Lambda handler for Stripe webhooks
    Route: POST /api/subscription/webhook

    Handles:
    - customer.subscription.created
    - customer.subscription.deleted
    - customer.subscription.updated
    """
    return adapter(event, context)
