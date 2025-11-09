"""
Lambda Handlers for Electromagnetic Beat Lab Microservices
Wraps FastAPI application for AWS Lambda deployment via Serverless Framework
"""

import json
import logging
import os
from typing import Dict, Any
from mangum import Mangum

# Import the main FastAPI app
from backend.main import app

# Setup logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# ============================================
# Mangum Adapter for FastAPI → Lambda
# ============================================
# This wraps the entire FastAPI app for Lambda execution
# Used during initial migration; will be replaced by individual microservices

mangum_handler = Mangum(app, lifespan="off")

# ============================================
# WebSocket Connection Handlers
# ============================================

def websocket_connect(event, context):
    """
    Handle WebSocket $connect route
    Store connection ID in DynamoDB for connection management
    """
    connection_id = event["requestContext"]["connectionId"]
    logger.info(f"WebSocket connect: {connection_id}")

    # TODO: Store connection in DynamoDB Connections table
    # For now, just return success

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Connected"})
    }


def websocket_disconnect(event, context):
    """
    Handle WebSocket $disconnect route
    Clean up connection from DynamoDB
    """
    connection_id = event["requestContext"]["connectionId"]
    logger.info(f"WebSocket disconnect: {connection_id}")

    # TODO: Remove connection from DynamoDB
    # TODO: Clean up any active audio sessions for this connection

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Disconnected"})
    }


def websocket_default(event, context):
    """
    Handle WebSocket $default route
    Process incoming WebSocket messages
    """
    connection_id = event["requestContext"]["connectionId"]
    body = json.loads(event.get("body", "{}"))

    logger.info(f"WebSocket message from {connection_id}: {body.get('type', 'unknown')}")

    # TODO: Route to appropriate handler based on message type
    # - start_stream → Initialize audio generation
    # - update_settings → Update real-time parameters
    # - stop_stream → Stop audio generation

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Message received"})
    }


# ============================================
# HTTP API Handlers
# ============================================

def audio_handler(event, context):
    """
    Handle all /audio/* endpoints
    Routes: /audio/generate, /audio/configure, /audio/protocols, etc.
    """
    logger.info(f"Audio handler invoked: {event.get('path', 'unknown')}")

    # Use Mangum to route FastAPI requests
    # This allows us to use existing FastAPI routes during migration
    return mangum_handler(event, context)


def health_check(event, context):
    """
    Handle /health endpoint
    Simple health check for Lambda function
    """
    logger.info("Health check requested")

    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps({
            "status": "healthy",
            "service": "electromagnetic-beat-lab",
            "function": context.function_name,
            "version": context.function_version
        })
    }


def auth_handler(event, context):
    """
    Handle all /auth/* endpoints
    Routes: /auth/login, /auth/refresh, /auth/logout, /auth/me
    """
    logger.info(f"Auth handler invoked: {event.get('path', 'unknown')}")

    # Use Mangum to route FastAPI requests
    return mangum_handler(event, context)


def timer_handler(event, context):
    """
    Handle all /timer/* endpoints
    Routes: /timer/start, /timer/pause, /timer/resume, /timer/stop
    """
    logger.info(f"Timer handler invoked: {event.get('path', 'unknown')}")

    # Use Mangum to route FastAPI requests
    return mangum_handler(event, context)


def payment_handler(event, context):
    """
    Handle all /payment/* endpoints
    Routes: /payment/create-checkout, /payment/webhook, /payment/subscription
    """
    logger.info(f"Payment handler invoked: {event.get('path', 'unknown')}")

    # Use Mangum to route FastAPI requests
    return mangum_handler(event, context)


def rag_handler(event, context):
    """
    Handle all /rag/* endpoints
    Routes: /rag/query, /rag/index, /rag/context
    """
    logger.info(f"RAG handler invoked: {event.get('path', 'unknown')}")

    # Use Mangum to route FastAPI requests
    return mangum_handler(event, context)


# ============================================
# EventBridge Event Handlers
# ============================================

def audio_session_event_handler(event, context):
    """
    Handle AudioSession.* events from EventBridge
    Example events: AudioSession.Started, AudioSession.Stopped
    """
    detail_type = event.get("detail-type", "unknown")
    detail = event.get("detail", {})

    logger.info(f"AudioSession event: {detail_type}")
    logger.info(f"Event detail: {detail}")

    # TODO: Implement event processing logic
    # - Update analytics
    # - Trigger notifications
    # - Update user statistics

    return {"statusCode": 200}


def timer_completed_event_handler(event, context):
    """
    Handle Timer.Completed events from EventBridge
    Triggered when a timer session completes
    """
    detail = event.get("detail", {})
    session_id = detail.get("session_id")
    user_id = detail.get("user_id")

    logger.info(f"Timer completed for session {session_id}, user {user_id}")

    # TODO: Implement completion logic
    # - Award points/achievements
    # - Update session statistics
    # - Send completion notification

    return {"statusCode": 200}


def subscription_changed_event_handler(event, context):
    """
    Handle User.SubscriptionChanged events from EventBridge
    Triggered when user subscription tier changes
    """
    detail = event.get("detail", {})
    user_id = detail.get("user_id")
    new_tier = detail.get("new_tier")

    logger.info(f"User {user_id} subscription changed to {new_tier}")

    # TODO: Implement subscription change logic
    # - Update user permissions
    # - Enable/disable premium features
    # - Send welcome/downgrade email

    return {"statusCode": 200}


# ============================================
# Stripe Webhook Handler
# ============================================

def stripe_webhook_handler(event, context):
    """
    Handle Stripe webhook events
    Verifies webhook signature and processes events
    """
    import stripe

    # Get webhook signature from headers
    signature = event.get("headers", {}).get("Stripe-Signature")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        # Verify webhook signature
        stripe_event = stripe.Webhook.construct_event(
            event.get("body"), signature, webhook_secret
        )

        event_type = stripe_event["type"]
        logger.info(f"Stripe webhook: {event_type}")

        # Handle different event types
        if event_type == "customer.subscription.created":
            # New subscription created
            subscription = stripe_event["data"]["object"]
            logger.info(f"New subscription: {subscription['id']}")
            # TODO: Update DynamoDB Subscriptions table

        elif event_type == "customer.subscription.updated":
            # Subscription updated (tier change, renewal)
            subscription = stripe_event["data"]["object"]
            logger.info(f"Updated subscription: {subscription['id']}")
            # TODO: Update DynamoDB Subscriptions table

        elif event_type == "customer.subscription.deleted":
            # Subscription canceled
            subscription = stripe_event["data"]["object"]
            logger.info(f"Deleted subscription: {subscription['id']}")
            # TODO: Update DynamoDB Subscriptions table
            # TODO: Publish User.SubscriptionChanged event

        elif event_type == "invoice.payment_succeeded":
            # Payment succeeded
            invoice = stripe_event["data"]["object"]
            logger.info(f"Payment succeeded: {invoice['id']}")
            # TODO: Record payment in DynamoDB

        elif event_type == "invoice.payment_failed":
            # Payment failed
            invoice = stripe_event["data"]["object"]
            logger.warning(f"Payment failed: {invoice['id']}")
            # TODO: Send payment failed notification

        return {
            "statusCode": 200,
            "body": json.dumps({"received": True})
        }

    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Webhook signature verification failed: {e}")
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid signature"})
        }
    except Exception as e:
        logger.error(f"Webhook processing failed: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }


# ============================================
# Scheduled Task Handlers
# ============================================

def cleanup_expired_sessions(event, context):
    """
    Scheduled task to clean up expired sessions
    Runs every hour via CloudWatch Events
    """
    logger.info("Cleaning up expired sessions")

    # TODO: Query DynamoDB for expired sessions (ttl)
    # TODO: Clean up associated resources
    # TODO: Log cleanup metrics

    return {"statusCode": 200, "cleaned": 0}


def generate_analytics_report(event, context):
    """
    Scheduled task to generate daily analytics
    Runs daily at midnight UTC via CloudWatch Events
    """
    logger.info("Generating daily analytics report")

    # TODO: Aggregate session data
    # TODO: Calculate user metrics
    # TODO: Store in DynamoDB or S3
    # TODO: Send summary email to admins

    return {"statusCode": 200}


# ============================================
# Utility Functions
# ============================================

def format_lambda_response(status_code: int, body: Dict[str, Any], headers: Dict[str, str] = None) -> Dict:
    """Format a standard Lambda HTTP response"""
    response = {
        "statusCode": status_code,
        "headers": headers or {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": True
        },
        "body": json.dumps(body)
    }
    return response


def parse_lambda_event(event: Dict) -> Dict[str, Any]:
    """Parse and extract common fields from Lambda event"""
    return {
        "method": event.get("httpMethod") or event.get("requestContext", {}).get("http", {}).get("method"),
        "path": event.get("path") or event.get("rawPath"),
        "query_params": event.get("queryStringParameters", {}),
        "headers": event.get("headers", {}),
        "body": json.loads(event.get("body", "{}")) if event.get("body") else {},
        "request_context": event.get("requestContext", {})
    }
