"""
Lambda handler for health check endpoint
"""

import json
import time


def handler(event, context):
    """
    AWS Lambda handler for health check
    Route: GET /health

    Returns a simple health check response
    """
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'status': 'healthy',
            'service': 'lambda-rest-api',
            'timestamp': time.time()
        })
    }
