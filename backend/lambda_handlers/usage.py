"""
Lambda handlers for usage tracking endpoints
"""

import json
from mangum import Mangum
from fastapi import FastAPI
from routes.simple_routes import router as simple_router

# Create minimal FastAPI app for usage endpoints
app = FastAPI()
app.include_router(simple_router, prefix="/api")

# Mangum adapter for AWS Lambda
adapter = Mangum(app, lifespan="off")


def check_handler(event, context):
    """
    AWS Lambda handler for usage check endpoints
    Routes:
    - GET /api/usage/check
    - GET /api/usage/{email}
    """
    return adapter(event, context)


def record_handler(event, context):
    """
    AWS Lambda handler for usage recording endpoints
    Routes:
    - POST /api/usage/anonymous
    - POST /api/usage/user
    """
    return adapter(event, context)
