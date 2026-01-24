"""
Logging configuration and utilities
"""
import logging
import sys
from logging.handlers import RotatingFileHandler
from pythonjsonlogger import jsonlogger
from config.config import get_config

config = get_config()


def setup_logging(app=None):
    """
    Configure application logging
    
    Args:
        app: Flask application instance (optional)
    """
    log_level = getattr(logging, config.LOG_LEVEL.upper(), logging.INFO)
    
    # Create logs directory if it doesn't exist
    import os
    os.makedirs('logs', exist_ok=True)
    
    # Create formatters
    json_formatter = jsonlogger.JsonFormatter(
        '%(timestamp)s %(level)s %(name)s %(message)s',
        rename_fields={'level': 'severity', 'timestamp': '@timestamp'}
    )
    
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # File handler with rotation
    file_handler = RotatingFileHandler(
        config.LOG_FILE,
        maxBytes=10485760,  # 10MB
        backupCount=10
    )
    file_handler.setLevel(log_level)
    file_handler.setFormatter(json_formatter)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(log_level)
    console_handler.setFormatter(console_formatter)
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)
    
    # Configure Flask app logger if provided
    if app:
        app.logger.setLevel(log_level)
        app.logger.addHandler(file_handler)
        app.logger.addHandler(console_handler)
    
    return root_logger


def get_logger(name):
    """
    Get logger instance with specified name
    
    Args:
        name: Logger name (usually __name__)
        
    Returns:
        Logger instance
    """
    return logging.getLogger(name)
