"""
Flask application factory
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flasgger import Swagger
from config.config import get_config
from app.utils.logger import setup_logging, get_logger
from app.utils.exceptions import AppException

logger = get_logger(__name__)


def create_app(config_name='development'):
    """
    Application factory pattern
    
    Args:
        config_name: Configuration environment name
        
    Returns:
        Flask application instance
    """
    app = Flask(__name__)
    
    # Load configuration
    config = get_config()
    app.config.from_object(config)
    
    # Setup logging
    setup_logging(app)
    
    # Initialize CORS
    CORS(app, origins=config.CORS_ORIGINS, supports_credentials=True)
    
    # Initialize rate limiter
    limiter = None
    if config.RATE_LIMIT_ENABLED:
        limiter = Limiter(
            app=app,
            key_func=get_remote_address,
            default_limits=[config.RATE_LIMIT_DEFAULT],
            storage_uri="memory://"
        )
    
    # Initialize Swagger API documentation
    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": 'apispec',
                "route": '/apispec.json',
                "rule_filter": lambda rule: True,
                "model_filter": lambda tag: True,
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/api/docs/"
    }
    
    swagger_template = {
        "info": {
            "title": "Dropout Prediction & Counseling System API",
            "description": "RESTful API for AI-Based Dropout Prediction and Counseling System",
            "version": "1.0.0",
            "contact": {
                "name": "API Support",
                "email": "support@example.com"
            }
        },
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'"
            }
        },
        "security": [
            {
                "Bearer": []
            }
        ]
    }
    
    Swagger(app, config=swagger_config, template=swagger_template)
    
    # Register blueprints
    from app.api.routes.auth_routes import auth_bp
    from app.api.routes.student_routes import student_bp
    from app.api.routes.prediction_routes import prediction_bp
    from app.api.routes.counseling_routes import counseling_bp
    from app.api.routes.model_routes import model_bp
    
    app.register_blueprint(auth_bp, url_prefix=f'{config.API_PREFIX}/auth')
    app.register_blueprint(student_bp, url_prefix=f'{config.API_PREFIX}/students')
    app.register_blueprint(prediction_bp, url_prefix=f'{config.API_PREFIX}/predictions')
    app.register_blueprint(counseling_bp, url_prefix=f'{config.API_PREFIX}/counseling')
    app.register_blueprint(model_bp, url_prefix=f'{config.API_PREFIX}/models')
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            "status": "healthy",
            "service": "Dropout Prediction API",
            "version": config.API_VERSION
        }), 200
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        """Root endpoint"""
        return jsonify({
            "message": "Dropout Prediction & Counseling System API",
            "version": config.API_VERSION,
            "docs": "/api/docs/",
            "health": "/health"
        }), 200
    
    # Error handlers
    @app.errorhandler(AppException)
    def handle_app_exception(error):
        """Handle custom application exceptions"""
        response = error.to_dict()
        return jsonify(response), error.status_code
    
    @app.errorhandler(404)
    def not_found(error):
        """Handle 404 errors"""
        return jsonify({
            "success": False,
            "error": True,
            "message": "Resource not found"
        }), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        """Handle 405 errors"""
        return jsonify({
            "success": False,
            "error": True,
            "message": "Method not allowed"
        }), 405
    
    @app.errorhandler(500)
    def internal_error(error):
        """Handle 500 errors"""
        logger.error(f"Internal server error: {str(error)}")
        return jsonify({
            "success": False,
            "error": True,
            "message": "Internal server error"
        }), 500
    
    # Request logging middleware
    @app.before_request
    def log_request():
        """Log incoming requests"""
        from flask import request
        logger.info(f"{request.method} {request.path} - {get_remote_address()}")
    
    @app.after_request
    def log_response(response):
        """Log outgoing responses"""
        from flask import request
        logger.info(f"{request.method} {request.path} - Status: {response.status_code}")
        return response
    
    logger.info(f"Application initialized with config: {config_name}")
    
    return app
