"""
Response helper functions
"""
from flask import jsonify
from typing import Any, Dict, Optional


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = 200,
    meta: Optional[Dict] = None
) -> tuple:
    """
    Create success response
    
    Args:
        data: Response data
        message: Success message
        status_code: HTTP status code
        meta: Additional metadata (pagination, etc.)
        
    Returns:
        Tuple of (response, status_code)
    """
    response = {
        "success": True,
        "message": message,
        "data": data
    }
    
    if meta:
        response["meta"] = meta
    
    return jsonify(response), status_code


def error_response(
    message: str = "An error occurred",
    status_code: int = 500,
    errors: Optional[Dict] = None
) -> tuple:
    """
    Create error response
    
    Args:
        message: Error message
        status_code: HTTP status code
        errors: Additional error details
        
    Returns:
        Tuple of (response, status_code)
    """
    response = {
        "success": False,
        "message": message,
        "error": True
    }
    
    if errors:
        response["errors"] = errors
    
    return jsonify(response), status_code


def paginated_response(
    data: list,
    page: int,
    page_size: int,
    total: int,
    message: str = "Success"
) -> tuple:
    """
    Create paginated response
    
    Args:
        data: List of items
        page: Current page number
        page_size: Items per page
        total: Total number of items
        message: Success message
        
    Returns:
        Tuple of (response, status_code)
    """
    total_pages = (total + page_size - 1) // page_size
    
    meta = {
        "page": page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_prev": page > 1
    }
    
    return success_response(data=data, message=message, meta=meta)
