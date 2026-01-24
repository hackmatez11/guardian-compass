"""
Counseling API routes
"""
from flask import Blueprint, request, g
from app.services.auth_service import require_auth, require_role
from app.services.counseling_service import CounselingService
from app.utils.response import success_response, error_response, paginated_response
from app.utils.exceptions import NotFoundError, ValidationError, DatabaseError
from app.utils.validators import validate_required_fields
from app.utils.logger import get_logger

logger = get_logger(__name__)
counseling_bp = Blueprint('counseling', __name__, url_prefix='/counseling')


@counseling_bp.route('/sessions', methods=['POST'])
@require_auth
@require_role('counselor', 'admin')
def create_session():
    """
    Create a new counseling session
    Requires: counselor or admin role
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        validate_required_fields(data, ['student_id', 'session_type'])
        
        # Add counselor info
        data['counselor_id'] = g.user.id
        
        session = CounselingService.create_session(data)
        
        return success_response(
            data=session,
            message="Counseling session created successfully",
            status_code=201
        )
        
    except (ValidationError, DatabaseError) as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Create session error: {str(e)}")
        return error_response("Failed to create session", 500)


@counseling_bp.route('/sessions/<session_id>', methods=['GET'])
@require_auth
def get_session(session_id):
    """Get counseling session by ID"""
    try:
        session = CounselingService.get_session(session_id)
        
        return success_response(data=session)
        
    except NotFoundError as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Get session error: {str(e)}")
        return error_response("Failed to get session", 500)


@counseling_bp.route('/sessions/<session_id>', methods=['PUT'])
@require_auth
@require_role('counselor', 'admin')
def update_session(session_id):
    """
    Update counseling session
    Requires: counselor or admin role
    """
    try:
        data = request.get_json()
        
        session = CounselingService.update_session(session_id, data)
        
        return success_response(
            data=session,
            message="Session updated successfully"
        )
        
    except (NotFoundError, ValidationError, DatabaseError) as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Update session error: {str(e)}")
        return error_response("Failed to update session", 500)


@counseling_bp.route('/sessions/student/<student_id>', methods=['GET'])
@require_auth
def get_student_sessions(student_id):
    """Get counseling sessions for a student"""
    try:
        limit = request.args.get('limit', 20, type=int)
        
        sessions = CounselingService.get_student_sessions(
            student_id,
            limit=limit
        )
        
        return success_response(data=sessions)
        
    except Exception as e:
        logger.error(f"Get student sessions error: {str(e)}")
        return error_response("Failed to get sessions", 500)


@counseling_bp.route('/sessions', methods=['GET'])
@require_auth
def list_sessions():
    """
    List counseling sessions with pagination
    Query params: page, page_size, filters
    """
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 20, type=int)
        
        # Build filters
        filters = {}
        if request.args.get('counselor_id'):
            filters['counselor_id'] = request.args.get('counselor_id')
        if request.args.get('student_id'):
            filters['student_id'] = request.args.get('student_id')
        if request.args.get('session_type'):
            filters['session_type'] = request.args.get('session_type')
        
        sessions, total = CounselingService.list_sessions(
            page=page,
            page_size=page_size,
            filters=filters
        )
        
        return paginated_response(
            data=sessions,
            page=page,
            page_size=page_size,
            total=total
        )
        
    except Exception as e:
        logger.error(f"List sessions error: {str(e)}")
        return error_response("Failed to list sessions", 500)


@counseling_bp.route('/recommendations', methods=['POST'])
@require_auth
@require_role('counselor', 'admin')
def create_recommendation():
    """
    Create a counseling recommendation
    Requires: counselor or admin role
    """
    try:
        data = request.get_json()
        
        validate_required_fields(data, ['student_id', 'recommendation_type', 'description'])
        
        # Add counselor info
        data['counselor_id'] = g.user.id
        
        recommendation = CounselingService.create_recommendation(data)
        
        return success_response(
            data=recommendation,
            message="Recommendation created successfully",
            status_code=201
        )
        
    except (ValidationError, DatabaseError) as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Create recommendation error: {str(e)}")
        return error_response("Failed to create recommendation", 500)


@counseling_bp.route('/recommendations/student/<student_id>', methods=['GET'])
@require_auth
def get_student_recommendations(student_id):
    """
    Get recommendations for a student
    Query params: status (pending/in_progress/completed)
    """
    try:
        status = request.args.get('status')
        
        recommendations = CounselingService.get_student_recommendations(
            student_id,
            status=status
        )
        
        return success_response(data=recommendations)
        
    except Exception as e:
        logger.error(f"Get student recommendations error: {str(e)}")
        return error_response("Failed to get recommendations", 500)


@counseling_bp.route('/recommendations/<recommendation_id>', methods=['PUT'])
@require_auth
@require_role('counselor', 'admin')
def update_recommendation(recommendation_id):
    """
    Update recommendation
    Requires: counselor or admin role
    """
    try:
        data = request.get_json()
        
        recommendation = CounselingService.update_recommendation(
            recommendation_id,
            data
        )
        
        return success_response(
            data=recommendation,
            message="Recommendation updated successfully"
        )
        
    except (NotFoundError, ValidationError, DatabaseError) as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Update recommendation error: {str(e)}")
        return error_response("Failed to update recommendation", 500)


@counseling_bp.route('/followups', methods=['GET'])
@require_auth
@require_role('counselor', 'admin')
def get_pending_followups():
    """
    Get sessions requiring follow-up
    Requires: counselor or admin role
    Query params: counselor_id (optional)
    """
    try:
        counselor_id = request.args.get('counselor_id')
        
        followups = CounselingService.get_pending_followups(counselor_id)
        
        return success_response(
            data=followups,
            message=f"Found {len(followups)} pending follow-ups"
        )
        
    except Exception as e:
        logger.error(f"Get pending followups error: {str(e)}")
        return error_response("Failed to get follow-ups", 500)
