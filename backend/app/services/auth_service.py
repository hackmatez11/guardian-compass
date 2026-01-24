"""
Authentication service for user management and JWT tokens
"""
from functools import wraps
from flask import request, g
from typing import Dict, Optional
from config.supabase import supabase_client
from app.utils.exceptions import AuthenticationError, AuthorizationError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class AuthService:
    """Handle authentication operations"""
    
    @staticmethod
    def sign_up(email: str, password: str, user_data: Optional[Dict] = None) -> Dict:
        """
        Register a new user
        
        Args:
            email: User email
            password: User password
            user_data: Additional user metadata
            
        Returns:
            User data and session
        """
        try:
            response = supabase_client.auth.sign_up({
                "email": email,
                "password": password,
                "options": {
                    "data": user_data or {}
                }
            })
            
            logger.info(f"User registered successfully: {email}")
            return {
                "user": response.user,
                "session": response.session
            }
            
        except Exception as e:
            logger.error(f"Sign up failed: {str(e)}")
            raise AuthenticationError(f"Registration failed: {str(e)}")
    
    @staticmethod
    def sign_in(email: str, password: str) -> Dict:
        """
        Authenticate user and get session
        
        Args:
            email: User email
            password: User password
            
        Returns:
            User data and session with access token
        """
        try:
            response = supabase_client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            logger.info(f"User signed in successfully: {email}")
            return {
                "user": response.user,
                "session": response.session,
                "access_token": response.session.access_token
            }
            
        except Exception as e:
            logger.error(f"Sign in failed: {str(e)}")
            raise AuthenticationError("Invalid email or password")
    
    @staticmethod
    def sign_out(access_token: str) -> None:
        """Sign out user"""
        try:
            supabase_client.auth.sign_out()
            logger.info("User signed out successfully")
        except Exception as e:
            logger.error(f"Sign out failed: {str(e)}")
            raise AuthenticationError(f"Sign out failed: {str(e)}")
    
    @staticmethod
    def get_user_from_token(access_token: str) -> Dict:
        """
        Get user information from access token
        
        Args:
            access_token: JWT access token
            
        Returns:
            User data
        """
        try:
            response = supabase_client.auth.get_user(access_token)
            return response.user
            
        except Exception as e:
            logger.error(f"Get user from token failed: {str(e)}")
            raise AuthenticationError("Invalid or expired token")
    
    @staticmethod
    def refresh_session(refresh_token: str) -> Dict:
        """
        Refresh access token using refresh token
        
        Args:
            refresh_token: Refresh token
            
        Returns:
            New session data
        """
        try:
            response = supabase_client.auth.refresh_session(refresh_token)
            logger.info("Session refreshed successfully")
            return {
                "session": response.session,
                "access_token": response.session.access_token
            }
            
        except Exception as e:
            logger.error(f"Refresh session failed: {str(e)}")
            raise AuthenticationError("Failed to refresh session")
    
    @staticmethod
    def reset_password_request(email: str) -> None:
        """
        Send password reset email
        
        Args:
            email: User email
        """
        try:
            supabase_client.auth.reset_password_email(email)
            logger.info(f"Password reset email sent to: {email}")
            
        except Exception as e:
            logger.error(f"Password reset request failed: {str(e)}")
            raise AuthenticationError(f"Failed to send reset email: {str(e)}")
    
    @staticmethod
    def update_password(access_token: str, new_password: str) -> None:
        """
        Update user password
        
        Args:
            access_token: User access token
            new_password: New password
        """
        try:
            supabase_client.auth.update_user(
                access_token,
                {"password": new_password}
            )
            logger.info("Password updated successfully")
            
        except Exception as e:
            logger.error(f"Password update failed: {str(e)}")
            raise AuthenticationError(f"Failed to update password: {str(e)}")


def get_auth_token() -> Optional[str]:
    """Extract authorization token from request header"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return None
    
    parts = auth_header.split()
    
    if len(parts) != 2 or parts[0].lower() != 'bearer':
        return None
    
    return parts[1]


def require_auth(f):
    """
    Decorator to require authentication
    Sets g.user with authenticated user data
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = get_auth_token()
        
        if not token:
            raise AuthenticationError("No authentication token provided")
        
        try:
            user = AuthService.get_user_from_token(token)
            g.user = user
            g.token = token
            
        except Exception as e:
            raise AuthenticationError(str(e))
        
        return f(*args, **kwargs)
    
    return decorated_function


def require_role(*allowed_roles):
    """
    Decorator to require specific user role
    Must be used after @require_auth
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(g, 'user'):
                raise AuthenticationError("User not authenticated")
            
            user_role = g.user.user_metadata.get('role')
            
            if user_role not in allowed_roles:
                raise AuthorizationError(
                    f"Access denied. Required roles: {', '.join(allowed_roles)}"
                )
            
            return f(*args, **kwargs)
        
        return decorated_function
    
    return decorator
