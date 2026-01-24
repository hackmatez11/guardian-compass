"""
Validation utilities
"""
import re
from typing import Any, Dict, List, Optional
from app.utils.exceptions import ValidationError


def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password: str, min_length: int = 8) -> tuple:
    """
    Validate password strength
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(password) < min_length:
        return False, f"Password must be at least {min_length} characters"
    
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    
    if not re.search(r'\d', password):
        return False, "Password must contain at least one digit"
    
    return True, None


def validate_required_fields(data: Dict, required_fields: List[str]) -> None:
    """
    Validate that required fields are present
    
    Args:
        data: Dictionary to validate
        required_fields: List of required field names
        
    Raises:
        ValidationError: If required fields are missing
    """
    missing_fields = [field for field in required_fields if field not in data or data[field] is None]
    
    if missing_fields:
        raise ValidationError(
            f"Missing required fields: {', '.join(missing_fields)}",
            payload={"missing_fields": missing_fields}
        )


def validate_enum(value: Any, allowed_values: List, field_name: str = "field") -> None:
    """
    Validate that value is in allowed enum values
    
    Args:
        value: Value to validate
        allowed_values: List of allowed values
        field_name: Name of the field for error message
        
    Raises:
        ValidationError: If value is not in allowed values
    """
    if value not in allowed_values:
        raise ValidationError(
            f"Invalid {field_name}. Allowed values: {', '.join(map(str, allowed_values))}",
            payload={"allowed_values": allowed_values}
        )


def validate_range(
    value: float,
    min_val: Optional[float] = None,
    max_val: Optional[float] = None,
    field_name: str = "field"
) -> None:
    """
    Validate that numeric value is within range
    
    Args:
        value: Value to validate
        min_val: Minimum allowed value
        max_val: Maximum allowed value
        field_name: Name of the field for error message
        
    Raises:
        ValidationError: If value is out of range
    """
    if min_val is not None and value < min_val:
        raise ValidationError(f"{field_name} must be at least {min_val}")
    
    if max_val is not None and value > max_val:
        raise ValidationError(f"{field_name} must be at most {max_val}")


def sanitize_string(value: str) -> str:
    """Remove potentially dangerous characters from string"""
    # Remove null bytes and control characters
    return re.sub(r'[\x00-\x1f\x7f-\x9f]', '', value).strip()
