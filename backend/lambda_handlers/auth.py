"""
Lambda handler for authentication endpoints
"""

import json
from mangum import Mangum
from fastapi import FastAPI
from routes.simple_routes import router as simple_router

# Create minimal FastAPI app for auth endpoints
app = FastAPI()
app.include_router(simple_router, prefix="/api")

# Mangum adapter for AWS Lambda
handler = Mangum(app, lifespan="off")


def lambda_handler(event, context):
    """
    AWS Lambda handler for authentication endpoints
    Routes: POST /api/auth/oauth
    """
    return handler(event, context)
