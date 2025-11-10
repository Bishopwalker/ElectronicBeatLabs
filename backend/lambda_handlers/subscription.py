"""
Lambda handlers for subscription and payment endpoints
"""

import json
from mangum import Mangum
from fastapi import FastAPI
from routes.simple_routes import router as simple_router

# Create minimal FastAPI app for subscription endpoints
app = FastAPI()
app.include_router(simple_router, prefix="/api")

# Mangum adapter for AWS Lambda
adapter = Mangum(app, lifespan="off")


def plans_handler(event, context):
    """
    AWS Lambda handler for subscription plans
    Route: GET /api/subscription/plans
    """
    return adapter(event, context)


def payment_handler(event, context):
    """
    AWS Lambda handler for payment intent creation
    Route: POST /api/subscription/create-payment-intent
    """
    return adapter(event, context)


def status_handler(event, context):
    """
    AWS Lambda handler for subscription status
    Route: GET /api/subscription/status/{email}
    """
    return adapter(event, context)
