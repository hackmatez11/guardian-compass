"""
Student API routes
"""
from flask import Blueprint, request, g
from app.services.auth_service import require_auth, require_role
from app.services.student_service import StudentService
from app.utils.response import success_response, error_response, paginated_response
from app.utils.exceptions import NotFoundError, ValidationError, DatabaseError
from app.utils.validators import validate_required_fields
from app.utils.logger import get_logger

logger = get_logger(__name__)
student_bp = Blueprint('students', __name__, url_prefix='/students')


@student_bp.route('', methods=['POST'])
@require_auth
@require_role('admin', 'counselor')
def create_student():
    """
    Create a new student
    Requires: admin or counselor role
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        validate_required_fields(data, ['student_id', 'name', 'email'])
        
        student = StudentService.create_student(data)
        
        return success_response(
            data=student,
            message="Student created successfully",
            status_code=201
        )
        
    except (ValidationError, DatabaseError) as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Create student error: {str(e)}")
        return error_response("Failed to create student", 500)


@student_bp.route('/<student_id>', methods=['GET'])
@require_auth
def get_student(student_id):
    """Get student by ID"""
    try:
        student = StudentService.get_student(student_id)
        
        return success_response(data=student)
        
    except NotFoundError as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Get student error: {str(e)}")
        return error_response("Failed to get student", 500)


@student_bp.route('/<student_id>', methods=['PUT'])
@require_auth
@require_role('admin', 'counselor')
def update_student(student_id):
    """
    Update student information
    Requires: admin or counselor role
    """
    try:
        data = request.get_json()
        
        # Don't allow changing student_id
        data.pop('student_id', None)
        
        student = StudentService.update_student(student_id, data)
        
        return success_response(
            data=student,
            message="Student updated successfully"
        )
        
    except (NotFoundError, ValidationError, DatabaseError) as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Update student error: {str(e)}")
        return error_response("Failed to update student", 500)


@student_bp.route('/<student_id>', methods=['DELETE'])
@require_auth
@require_role('admin')
def delete_student(student_id):
    """
    Delete student
    Requires: admin role
    """
    try:
        StudentService.delete_student(student_id)
        
        return success_response(message="Student deleted successfully")
        
    except NotFoundError as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Delete student error: {str(e)}")
        return error_response("Failed to delete student", 500)


@student_bp.route('', methods=['GET'])
@require_auth
def list_students():
    """
    List students with pagination
    Query params: page, page_size, filters
    """
    try:
        page = request.args.get('page', 1, type=int)
        page_size = request.args.get('page_size', 20, type=int)
        
        # Build filters from query params
        filters = {}
        if request.args.get('department'):
            filters['department'] = request.args.get('department')
        if request.args.get('year'):
            filters['year'] = request.args.get('year')
        
        students, total = StudentService.list_students(
            page=page,
            page_size=page_size,
            filters=filters
        )
        
        return paginated_response(
            data=students,
            page=page,
            page_size=page_size,
            total=total
        )
        
    except Exception as e:
        logger.error(f"List students error: {str(e)}")
        return error_response("Failed to list students", 500)


@student_bp.route('/<student_id>/academic-data', methods=['GET'])
@require_auth
def get_student_academic_data(student_id):
    """Get comprehensive academic data for a student"""
    try:
        data = StudentService.get_student_academic_data(student_id)
        
        return success_response(data=data)
        
    except NotFoundError as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Get academic data error: {str(e)}")
        return error_response("Failed to get academic data", 500)


@student_bp.route('/bulk-import', methods=['POST'])
@require_auth
@require_role('admin')
def bulk_import_students():
    """
    Bulk import students
    Requires: admin role
    
    Request Body:
        students: Array of student objects
    """
    try:
        data = request.get_json()
        
        validate_required_fields(data, ['students'])
        
        if not isinstance(data['students'], list):
            raise ValidationError("students must be an array")
        
        result = StudentService.bulk_import_students(data['students'])
        
        return success_response(
            data=result,
            message=f"Imported {result['imported']} students successfully"
        )
        
    except (ValidationError, DatabaseError) as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Bulk import error: {str(e)}")
        return error_response("Failed to import students", 500)
