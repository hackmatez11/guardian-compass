"""
Utility functions package
"""
from .logger import setup_logging, get_logger
from .exceptions import (
    AppException,
    AuthenticationError,
    AuthorizationError,
    ValidationError,
    NotFoundError,
    ConflictError,
    ModelError,
    DatabaseError
)
from .response import success_response, error_response, paginated_response
from .validators import (
    validate_email,
    validate_password,
    validate_required_fields,
    validate_enum,
    validate_range,
    sanitize_string
)

__all__ = [
    'setup_logging',
    'get_logger',
    'AppException',
    'AuthenticationError',
    'AuthorizationError',
    'ValidationError',
    'NotFoundError',
    'ConflictError',
    'ModelError',
    'DatabaseError',
    'success_response',
    'error_response',
    'paginated_response',
    'validate_email',
    'validate_password',
    'validate_required_fields',
    'validate_enum',
    'validate_range',
    'sanitize_string'
]
