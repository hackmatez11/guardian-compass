"""
Custom exceptions for the application
"""


class AppException(Exception):
    """Base application exception"""
    
    def __init__(self, message, status_code=500, payload=None):
        super().__init__()
        self.message = message
        self.status_code = status_code
        self.payload = payload
    
    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        rv['error'] = True
        return rv


class AuthenticationError(AppException):
    """Authentication failed exception"""
    
    def __init__(self, message="Authentication failed", payload=None):
        super().__init__(message, status_code=401, payload=payload)


class AuthorizationError(AppException):
    """Authorization failed exception"""
    
    def __init__(self, message="Access denied", payload=None):
        super().__init__(message, status_code=403, payload=payload)


class ValidationError(AppException):
    """Data validation failed exception"""
    
    def __init__(self, message="Validation failed", payload=None):
        super().__init__(message, status_code=400, payload=payload)


class NotFoundError(AppException):
    """Resource not found exception"""
    
    def __init__(self, message="Resource not found", payload=None):
        super().__init__(message, status_code=404, payload=payload)


class ConflictError(AppException):
    """Resource conflict exception"""
    
    def __init__(self, message="Resource conflict", payload=None):
        super().__init__(message, status_code=409, payload=payload)


class ModelError(AppException):
    """ML Model operation failed exception"""
    
    def __init__(self, message="Model operation failed", payload=None):
        super().__init__(message, status_code=500, payload=payload)


class DatabaseError(AppException):
    """Database operation failed exception"""
    
    def __init__(self, message="Database operation failed", payload=None):
        super().__init__(message, status_code=500, payload=payload)
