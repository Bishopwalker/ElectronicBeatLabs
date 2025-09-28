"""
Electromagnetic Beat Lab - AWS Lambda Handlers
Serverless handlers for WebSocket and HTTP endpoints
"""

import json
import boto3
import logging
from datetime import datetime, timedelta
from typing import Dict, Any
import asyncio
import os

# Import your existing modules
from core.audio_engine import AudioEngine
from modules.spatial_audio import SpatialAudioProcessor

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Global instances (Lambda container reuse)
audio_engine = AudioEngine(sample_rate=48000)
spatial_processor = SpatialAudioProcessor(sample_rate=48000)
audio_engine.set_spatial_processor(spatial_processor)

# DynamoDB clients
dynamodb = boto3.resource('dynamodb')
connections_table = dynamodb.Table(f"{os.environ.get('SERVICE_NAME', 'electromagnetic-beat-lab')}-{os.environ.get('STAGE', 'dev')}-connections")
sessions_table = dynamodb.Table(f"{os.environ.get('SERVICE_NAME', 'electromagnetic-beat-lab')}-{os.environ.get('STAGE', 'dev')}-sessions")

# API Gateway Management API client
apigateway_client = None

def get_apigateway_client(event):
    """Get API Gateway Management API client for WebSocket"""
    global apigateway_client
    if not apigateway_client:
        domain_name = event['requestContext']['domainName']
        stage = event['requestContext']['stage']
        endpoint = f"https://{domain_name}/{stage}"
        apigateway_client = boto3.client('apigatewaymanagementapi', endpoint_url=endpoint)
    return apigateway_client

def lambda_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """Standard Lambda response format"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        'body': json.dumps(body)
    }

# ==========================================
# WebSocket Handlers
# ==========================================

def websocket_connect(event, context):
    """Handle WebSocket connection"""
    connection_id = event['requestContext']['connectionId']
    
    try:
        # Store connection in DynamoDB
        connections_table.put_item(
            Item={
                'connection_id': connection_id,
                'connected_at': datetime.now().isoformat(),
                'ttl': int((datetime.now() + timedelta(hours=2)).timestamp())
            }
        )
        
        logger.info(f"WebSocket connected: {connection_id}")
        return {'statusCode': 200}
        
    except Exception as e:
        logger.error(f"Connection error: {str(e)}")
        return {'statusCode': 500}

def websocket_disconnect(event, context):
    """Handle WebSocket disconnection"""
    connection_id = event['requestContext']['connectionId']
    
    try:
        # Remove connection from DynamoDB
        connections_table.delete_item(
            Key={'connection_id': connection_id}
        )
        
        # Stop any active audio sessions for this connection
        audio_engine.stop_session(connection_id)
        
        logger.info(f"WebSocket disconnected: {connection_id}")
        return {'statusCode': 200}
        
    except Exception as e:
        logger.error(f"Disconnection error: {str(e)}")
        return {'statusCode': 500}

def websocket_default(event, context):
    """Handle WebSocket messages"""
    connection_id = event['requestContext']['connectionId']
    
    try:
        # Parse message
        body = json.loads(event.get('body', '{}'))
        message_type = body.get('type')
        
        logger.info(f"WebSocket message: {message_type} from {connection_id}")
        
        response_data = {}
        
        if message_type == "start_session":
            settings = body.get('settings', {})
            validated_settings = audio_engine.validate_frequencies(settings)
            session_id = audio_engine.start_session(validated_settings)
            
            # Store session in DynamoDB
            sessions_table.put_item(
                Item={
                    'session_id': session_id,
                    'connection_id': connection_id,
                    'settings': validated_settings,
                    'created_at': datetime.now().isoformat(),
                    'ttl': int((datetime.now() + timedelta(hours=1)).timestamp())
                }
            )
            
            response_data = {
                'type': 'session_started',
                'session_id': session_id,
                'settings': validated_settings
            }
            
        elif message_type == "stop_session":
            audio_engine.stop_session(connection_id)
            response_data = {
                'type': 'session_stopped',
                'connection_id': connection_id
            }
            
        elif message_type == "update_settings":
            settings = body.get('settings', {})
            validated_settings = audio_engine.validate_frequencies(settings)
            audio_engine.update_settings(connection_id, validated_settings)
            
            response_data = {
                'type': 'settings_updated',
                'settings': validated_settings
            }
            
        elif message_type == "get_frame":
            # Generate audio frame
            frame_data = asyncio.run(audio_engine.generate_frame(connection_id))
            response_data = {
                'type': 'audio_frame',
                'data': frame_data
            }
        
        else:
            response_data = {
                'type': 'error',
                'message': f'Unknown message type: {message_type}'
            }
        
        # Send response back to client
        apigateway = get_apigateway_client(event)
        apigateway.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps(response_data)
        )
        
        return {'statusCode': 200}
        
    except Exception as e:
        logger.error(f"WebSocket message error: {str(e)}")
        try:
            # Send error to client
            apigateway = get_apigateway_client(event)
            apigateway.post_to_connection(
                ConnectionId=connection_id,
                Data=json.dumps({
                    'type': 'error',
                    'message': str(e)
                })
            )
        except:
            pass
        return {'statusCode': 500}

# ==========================================
# HTTP API Handlers
# ==========================================

def health_check(event, context):
    """Health check endpoint"""
    return lambda_response(200, {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'service': 'electromagnetic-beat-lab'
    })

def audio_handler(event, context):
    """Handle audio API requests"""
    try:
        http_method = event['httpMethod']
        path = event['path']
        
        if path == '/audio/protocols' and http_method == 'GET':
            # Get available protocols
            protocols = {
                'focus': audio_engine.create_adhd_protocol('focus'),
                'calm': audio_engine.create_adhd_protocol('calm'),
                'deep_focus': audio_engine.create_adhd_protocol('deep_focus'),
                'meditation': audio_engine.create_adhd_protocol('meditation')
            }
            return lambda_response(200, {'protocols': protocols})
        
        elif path == '/audio/status' and http_method == 'GET':
            # Get audio engine status
            return lambda_response(200, {
                'engine_running': audio_engine.is_running(),
                'active_sessions': len(audio_engine.sessions),
                'sample_rate': audio_engine.sample_rate,
                'timestamp': datetime.now().isoformat()
            })
        
        elif path == '/audio/validate' and http_method == 'POST':
            # Validate audio settings
            body = json.loads(event.get('body', '{}'))
            settings = body.get('settings', {})
            validated = audio_engine.validate_frequencies(settings)
            return lambda_response(200, {
                'original': settings,
                'validated': validated,
                'changes_made': settings != validated
            })
        
        else:
            return lambda_response(404, {'error': 'Endpoint not found'})
    
    except Exception as e:
        logger.error(f"Audio handler error: {str(e)}")
        return lambda_response(500, {'error': str(e)})

def auth_handler(event, context):
    """Handle authentication requests"""
    try:
        # For now, simple auth - extend as needed
        return lambda_response(200, {
            'authenticated': True,
            'user_id': 'anonymous',
            'session_token': 'temp-token'
        })
    
    except Exception as e:
        logger.error(f"Auth handler error: {str(e)}")
        return lambda_response(500, {'error': str(e)})