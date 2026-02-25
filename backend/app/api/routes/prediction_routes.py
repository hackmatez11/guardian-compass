"""
Prediction API routes
"""
from flask import Blueprint, request, g
import pandas as pd
from app.services.auth_service import require_auth, require_role
from app.services.ml_service import MLService
from app.services.prediction_service import PredictionService
from app.utils.response import success_response, error_response, paginated_response
from app.utils.exceptions import NotFoundError, ModelError, ValidationError
from app.utils.validators import validate_required_fields
from app.utils.logger import get_logger

logger = get_logger(__name__)
prediction_bp = Blueprint('predictions', __name__, url_prefix='/predictions')


# ── Static routes MUST come before dynamic /<prediction_id> ──────────────────

@prediction_bp.route('/statistics', methods=['GET'])
@require_auth
@require_role('admin', 'counselor')
def get_statistics():
    """
    Get prediction statistics
    Requires: admin or counselor role
    """
    try:
        stats = PredictionService.get_prediction_statistics()
        return success_response(data=stats)

    except Exception as e:
        logger.error(f"Get statistics error: {str(e)}")
        return error_response("Failed to get statistics", 500)


@prediction_bp.route('/high-risk', methods=['GET'])
@require_auth
@require_role('admin', 'counselor')
def get_high_risk_students():
    """
    Get students with high dropout risk
    Requires: admin or counselor role
    """
    try:
        limit = request.args.get('limit', 50, type=int)
        high_risk = PredictionService.get_high_risk_students(limit=limit)

        return success_response(
            data=high_risk,
            message=f"Found {len(high_risk)} high-risk students"
        )

    except Exception as e:
        logger.error(f"Get high risk students error: {str(e)}")
        return error_response("Failed to get high risk students", 500)


@prediction_bp.route('/predict/batch', methods=['POST'])
@require_auth
@require_role('admin', 'counselor')
def predict_batch():
    """
    Batch predict dropout risk for multiple students
    Requires: admin or counselor role

    Request Body:
        student_ids: Array of student IDs
        save_predictions: Whether to save results (default: true)
    """
    try:
        data = request.get_json()
        validate_required_fields(data, ['student_ids'])

        if not isinstance(data['student_ids'], list):
            raise ValidationError("student_ids must be an array")

        save_predictions = data.get('save_predictions', True)

        predictions = MLService.predict_batch(
            data['student_ids'],
            save_predictions=save_predictions
        )

        successful = len([p for p in predictions if 'error' not in p])
        failed = len([p for p in predictions if 'error' in p])

        return success_response(
            data={
                'predictions': predictions,
                'summary': {
                    'total': len(predictions),
                    'successful': successful,
                    'failed': failed
                }
            },
            message=f"Batch prediction completed. {successful}/{len(predictions)} successful"
        )

    except (ValidationError, ModelError) as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Batch predict error: {str(e)}")
        return error_response("Batch prediction failed", 500)


@prediction_bp.route('/predict/<student_id>', methods=['POST'])
@require_auth
@require_role('admin', 'counselor')
def predict_dropout(student_id):
    """
    Predict dropout risk for a student
    Requires: admin or counselor role
    """
    try:
        save_prediction = request.args.get('save', 'true').lower() == 'true'

        prediction = MLService.predict_student_dropout(
            student_id,
            save_prediction=save_prediction
        )

        return success_response(
            data=prediction,
            message="Prediction completed successfully"
        )

    except (NotFoundError, ModelError) as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Predict dropout error: {str(e)}")
        return error_response("Prediction failed", 500)


@prediction_bp.route('/student/<student_id>', methods=['GET'])
@require_auth
def get_student_predictions(student_id):
    """Get prediction history for a student"""
    try:
        limit = request.args.get('limit', 10, type=int)

        predictions = PredictionService.get_student_predictions(
            student_id,
            limit=limit
        )

        return success_response(data=predictions)

    except Exception as e:
        logger.error(f"Get student predictions error: {str(e)}")
        return error_response("Failed to get predictions", 500)


@prediction_bp.route('/student/<student_id>/latest', methods=['GET'])
@require_auth
def get_latest_prediction(student_id):
    """Get the most recent prediction for a student"""
    try:
        prediction = PredictionService.get_latest_prediction(student_id)

        if not prediction:
            return error_response("No predictions found for this student", 404)

        return success_response(data=prediction)

    except Exception as e:
        logger.error(f"Get latest prediction error: {str(e)}")
        return error_response("Failed to get latest prediction", 500)


@prediction_bp.route('', methods=['GET'])
@require_auth
def list_predictions():
    """
    List predictions with pagination and filters
    Query params: page, page_size, risk_level
    """
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 20, type=int)
        risk_level = request.args.get('risk_level')
        
        predictions, total = PredictionService.list_predictions(
            page=page,
            page_size=page_size,
            risk_level=risk_level
        )

        return paginated_response(
            data=predictions,
            page=page,
            page_size=page_size,
            total=total
        )

    except Exception as e:
        logger.error(f"List predictions error: {str(e)}")
        return error_response("Failed to list predictions", 500)


# ── Dynamic route MUST come last so it doesn't swallow static paths ───────────

@prediction_bp.route('/<prediction_id>', methods=['GET'])
@require_auth
def get_prediction(prediction_id):
    """Get prediction by ID"""
    try:
        prediction = PredictionService.get_prediction(prediction_id)
        return success_response(data=prediction)

    except NotFoundError as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Get prediction error: {str(e)}")
        return error_response("Failed to get prediction", 500)
