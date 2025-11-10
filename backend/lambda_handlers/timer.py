"""
Lambda handler for timer management endpoints
"""

import json
from mangum import Mangum
from fastapi import FastAPI
from routes.timer import router as timer_router

# Create minimal FastAPI app for timer endpoints
app = FastAPI()
app.include_router(timer_router, prefix="/api")

# Mangum adapter for AWS Lambda
adapter = Mangum(app, lifespan="off")


def handler(event, context):
    """
    AWS Lambda handler for timer endpoints
    Routes:
    - GET /api/timer/presets
    - POST /api/timer/presets
    - GET /api/timer/presets/{preset_id}
    - PUT /api/timer/presets/{preset_id}
    - DELETE /api/timer/presets/{preset_id}
    """
    return adapter(event, context)
