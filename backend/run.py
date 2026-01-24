"""
Application entry point
"""
import os
from app import create_app
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Create Flask application
app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    # Get configuration
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'True').lower() == 'true'
    
    logger.info(f"Starting Flask application on {host}:{port}")
    logger.info(f"Debug mode: {debug}")
    logger.info(f"API Documentation: http://{host}:{port}/api/docs/")
    
    # Run application
    app.run(
        host=host,
        port=port,
        debug=debug
    )
