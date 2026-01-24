"""
Authentication API routes
"""
from flask import Blueprint, request, g
from app.services.auth_service import AuthService, require_auth
from app.utils.response import success_response, error_response
from app.utils.exceptions import AuthenticationError, ValidationError
from app.utils.validators import validate_email, validate_password, validate_required_fields
from app.utils.logger import get_logger

logger = get_logger(__name__)
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """
    Register a new user
    
    Request Body:
        email: User email
        password: User password
        role: User role (student/counselor/admin)
        profile: Additional profile data
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        validate_required_fields(data, ['email', 'password', 'role'])
        
        email = data['email']
        password = data['password']
        role = data['role']
        
        # Validate email format
        if not validate_email(email):
            raise ValidationError("Invalid email format")
        
        # Validate password strength
        is_valid, error_msg = validate_password(password)
        if not is_valid:
            raise ValidationError(error_msg)
        
        # Validate role
        allowed_roles = ['student', 'counselor', 'admin']
        if role not in allowed_roles:
            raise ValidationError(f"Invalid role. Allowed: {', '.join(allowed_roles)}")
        
        # Prepare user metadata
        user_data = {
            'role': role,
            'name': data.get('name', ''),
            'profile': data.get('profile', {})
        }
        
        # Register user
        result = AuthService.sign_up(email, password, user_data)
        
        return success_response(
            data={
                'user': {
                    'id': result['user'].id,
                    'email': result['user'].email,
                    'role': role
                },
                'session': {
                    'access_token': result['session'].access_token if result['session'] else None
                }
            },
            message="User registered successfully"
        )
        
    except (AuthenticationError, ValidationError) as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Signup error: {str(e)}")
        return error_response("Registration failed", 500)


@auth_bp.route('/signin', methods=['POST'])
def signin():
    """
    Sign in user
    
    Request Body:
        email: User email
        password: User password
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        validate_required_fields(data, ['email', 'password'])
        
        email = data['email']
        password = data['password']
        
        # Sign in
        result = AuthService.sign_in(email, password)
        
        return success_response(
            data={
                'user': {
                    'id': result['user'].id,
                    'email': result['user'].email,
                    'role': result['user'].user_metadata.get('role', 'student')
                },
                'access_token': result['access_token'],
                'session': {
                    'expires_at': result['session'].expires_at
                }
            },
            message="Signed in successfully"
        )
        
    except AuthenticationError as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Signin error: {str(e)}")
        return error_response("Sign in failed", 500)


@auth_bp.route('/signout', methods=['POST'])
@require_auth
def signout():
    """Sign out current user"""
    try:
        AuthService.sign_out(g.token)
        
        return success_response(message="Signed out successfully")
        
    except AuthenticationError as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Signout error: {str(e)}")
        return error_response("Sign out failed", 500)


@auth_bp.route('/me', methods=['GET'])
@require_auth
def get_current_user():
    """Get current authenticated user"""
    try:
        return success_response(
            data={
                'id': g.user.id,
                'email': g.user.email,
                'role': g.user.user_metadata.get('role', 'student'),
                'profile': g.user.user_metadata.get('profile', {})
            }
        )
        
    except Exception as e:
        logger.error(f"Get current user error: {str(e)}")
        return error_response("Failed to get user info", 500)


@auth_bp.route('/refresh', methods=['POST'])
def refresh_session():
    """
    Refresh access token
    
    Request Body:
        refresh_token: Refresh token
    """
    try:
        data = request.get_json()
        
        validate_required_fields(data, ['refresh_token'])
        
        result = AuthService.refresh_session(data['refresh_token'])
        
        return success_response(
            data={
                'access_token': result['access_token'],
                'expires_at': result['session'].expires_at
            },
            message="Session refreshed successfully"
        )
        
    except AuthenticationError as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Refresh session error: {str(e)}")
        return error_response("Failed to refresh session", 500)


@auth_bp.route('/reset-password-request', methods=['POST'])
def reset_password_request():
    """
    Request password reset
    
    Request Body:
        email: User email
    """
    try:
        data = request.get_json()
        
        validate_required_fields(data, ['email'])
        
        AuthService.reset_password_request(data['email'])
        
        return success_response(message="Password reset email sent")
        
    except Exception as e:
        logger.error(f"Reset password request error: {str(e)}")
        # Return success even on error for security
        return success_response(message="If email exists, reset link will be sent")


@auth_bp.route('/update-password', methods=['POST'])
@require_auth
def update_password():
    """
    Update user password
    
    Request Body:
        new_password: New password
    """
    try:
        data = request.get_json()
        
        validate_required_fields(data, ['new_password'])
        
        # Validate new password
        is_valid, error_msg = validate_password(data['new_password'])
        if not is_valid:
            raise ValidationError(error_msg)
        
        AuthService.update_password(g.token, data['new_password'])
        
        return success_response(message="Password updated successfully")
        
    except (AuthenticationError, ValidationError) as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Update password error: {str(e)}")
        return error_response("Failed to update password", 500)
