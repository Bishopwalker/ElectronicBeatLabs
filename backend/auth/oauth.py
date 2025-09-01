"""
OAuth integration for Google, Facebook, and GitHub
"""

from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.requests import Request
import httpx
import os
from typing import Dict, Any, Optional

# Load environment variables
config = Config('.env')

# OAuth configuration
oauth = OAuth(config)

# Google OAuth
oauth.register(
    name='google',
    client_id=config.get('GOOGLE_CLIENT_ID'),
    client_secret=config.get('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid_configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# GitHub OAuth
oauth.register(
    name='github',
    client_id=config.get('GITHUB_CLIENT_ID'),
    client_secret=config.get('GITHUB_CLIENT_SECRET'),
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email'},
)

# Facebook OAuth
oauth.register(
    name='facebook',
    client_id=config.get('FACEBOOK_CLIENT_ID'),
    client_secret=config.get('FACEBOOK_CLIENT_SECRET'),
    access_token_url='https://graph.facebook.com/oauth/access_token',
    authorize_url='https://www.facebook.com/dialog/oauth',
    api_base_url='https://graph.facebook.com/',
    client_kwargs={'scope': 'email'},
)

class OAuthProvider:
    """
    OAuth provider handler
    """
    
    @staticmethod
    async def get_authorization_url(provider: str, redirect_uri: str) -> str:
        """
        Get authorization URL for OAuth provider
        """
        if provider not in ['google', 'github', 'facebook']:
            raise ValueError(f"Unsupported provider: {provider}")
        
        client = oauth.create_client(provider)
        authorization_url, state = client.create_authorization_url(
            redirect_uri=redirect_uri
        )
        return authorization_url
    
    @staticmethod
    async def exchange_code_for_token(provider: str, code: str, redirect_uri: str) -> Dict[str, Any]:
        """
        Exchange authorization code for access token
        """
        if provider not in ['google', 'github', 'facebook']:
            raise ValueError(f"Unsupported provider: {provider}")
        
        client = oauth.create_client(provider)
        token = await client.fetch_token(
            code=code,
            redirect_uri=redirect_uri
        )
        return token
    
    @staticmethod
    async def get_user_info(provider: str, token: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get user information from OAuth provider
        """
        if provider == 'google':
            return await OAuthProvider._get_google_user_info(token)
        elif provider == 'github':
            return await OAuthProvider._get_github_user_info(token)
        elif provider == 'facebook':
            return await OAuthProvider._get_facebook_user_info(token)
        else:
            raise ValueError(f"Unsupported provider: {provider}")
    
    @staticmethod
    async def _get_google_user_info(token: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get user info from Google
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                'https://www.googleapis.com/oauth2/v2/userinfo',
                headers={'Authorization': f'Bearer {token["access_token"]}'}
            )
            response.raise_for_status()
            return response.json()
    
    @staticmethod
    async def _get_github_user_info(token: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get user info from GitHub
        """
        async with httpx.AsyncClient() as client:
            # Get user info
            user_response = await client.get(
                'https://api.github.com/user',
                headers={'Authorization': f'token {token["access_token"]}'}
            )
            user_response.raise_for_status()
            user_data = user_response.json()
            
            # Get email if not public
            if not user_data.get('email'):
                email_response = await client.get(
                    'https://api.github.com/user/emails',
                    headers={'Authorization': f'token {token["access_token"]}'}
                )
                email_response.raise_for_status()
                emails = email_response.json()
                # Find primary email
                for email in emails:
                    if email.get('primary'):
                        user_data['email'] = email['email']
                        break
            
            return user_data
    
    @staticmethod
    async def _get_facebook_user_info(token: Dict[str, Any]) -> Dict[str, Any]:
        """
        Get user info from Facebook
        """
        async with httpx.AsyncClient() as client:
            response = await client.get(
                'https://graph.facebook.com/me',
                params={
                    'fields': 'id,name,email',
                    'access_token': token['access_token']
                }
            )
            response.raise_for_status()
            return response.json()

# Utility functions for OAuth flow
def get_oauth_redirect_uri(provider: str, base_url: str = "http://localhost:8000") -> str:
    """
    Get OAuth redirect URI for provider
    """
    return f"{base_url}/auth/{provider}/callback"

async def validate_oauth_state(stored_state: str, received_state: str) -> bool:
    """
    Validate OAuth state parameter to prevent CSRF
    """
    return stored_state == received_state