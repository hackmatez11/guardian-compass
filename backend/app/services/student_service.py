"""
Student service for managing student data
"""
from typing import Dict, List, Optional
from config.supabase import supabase_client
from app.utils.exceptions import NotFoundError, DatabaseError, ValidationError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class StudentService:
    """Handle student data operations"""
    
    TABLE_NAME = "students"
    
    @staticmethod
    def create_student(student_data: Dict) -> Dict:
        """
        Create a new student record
        
        Args:
            student_data: Student information
            
        Returns:
            Created student record
        """
        try:
            response = supabase_client.table(StudentService.TABLE_NAME)\
                .insert(student_data)\
                .execute()
            
            if response.data:
                logger.info(f"Student created: {student_data.get('student_id')}")
                return response.data[0]
            
            raise DatabaseError("Failed to create student")
            
        except Exception as e:
            logger.error(f"Create student failed: {str(e)}")
            raise DatabaseError(f"Failed to create student: {str(e)}")
    
    @staticmethod
    def get_student(student_id: str) -> Dict:
        """
        Get student by ID
        
        Args:
            student_id: Student ID
            
        Returns:
            Student record
        """
        try:
            response = supabase_client.table(StudentService.TABLE_NAME)\
                .select("*")\
                .eq("student_id", student_id)\
                .execute()
            
            if not response.data:
                raise NotFoundError(f"Student not found: {student_id}")
            
            return response.data[0]
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Get student failed: {str(e)}")
            raise DatabaseError(f"Failed to get student: {str(e)}")
    
    @staticmethod
    def update_student(student_id: str, update_data: Dict) -> Dict:
        """
        Update student record
        
        Args:
            student_id: Student ID
            update_data: Fields to update
            
        Returns:
            Updated student record
        """
        try:
            response = supabase_client.table(StudentService.TABLE_NAME)\
                .update(update_data)\
                .eq("student_id", student_id)\
                .execute()
            
            if not response.data:
                raise NotFoundError(f"Student not found: {student_id}")
            
            logger.info(f"Student updated: {student_id}")
            return response.data[0]
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Update student failed: {str(e)}")
            raise DatabaseError(f"Failed to update student: {str(e)}")
    
    @staticmethod
    def delete_student(student_id: str) -> None:
        """
        Delete student record
        
        Args:
            student_id: Student ID
        """
        try:
            response = supabase_client.table(StudentService.TABLE_NAME)\
                .delete()\
                .eq("student_id", student_id)\
                .execute()
            
            if not response.data:
                raise NotFoundError(f"Student not found: {student_id}")
            
            logger.info(f"Student deleted: {student_id}")
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Delete student failed: {str(e)}")
            raise DatabaseError(f"Failed to delete student: {str(e)}")
    
    @staticmethod
    def list_students(
        page: int = 1,
        page_size: int = 20,
        filters: Optional[Dict] = None,
        order_by: str = "created_at",
        ascending: bool = False
    ) -> tuple:
        """
        List students with pagination and filters
        
        Args:
            page: Page number (1-indexed)
            page_size: Number of items per page
            filters: Filter conditions
            order_by: Field to order by
            ascending: Sort order
            
        Returns:
            Tuple of (students list, total count)
        """
        try:
            # Build query
            query = supabase_client.table(StudentService.TABLE_NAME).select("*", count="exact")
            
            # Apply filters
            if filters:
                for key, value in filters.items():
                    if value is not None:
                        query = query.eq(key, value)
            
            # Apply ordering
            query = query.order(order_by, desc=not ascending)
            
            # Apply pagination
            start = (page - 1) * page_size
            end = start + page_size - 1
            query = query.range(start, end)
            
            # Execute query
            response = query.execute()
            
            return response.data, response.count
            
        except Exception as e:
            logger.error(f"List students failed: {str(e)}")
            raise DatabaseError(f"Failed to list students: {str(e)}")
    
    @staticmethod
    def get_student_academic_data(student_id: str) -> Dict:
        """
        Get comprehensive academic data for a student
        
        Args:
            student_id: Student ID
            
        Returns:
            Academic data including grades, attendance, etc.
        """
        try:
            # Get student basic info
            student = StudentService.get_student(student_id)
            
            # Get academic records
            academic_response = supabase_client.table("academic_records")\
                .select("*")\
                .eq("student_id", student_id)\
                .order("semester", desc=True)\
                .execute()
            
            # Get attendance records
            attendance_response = supabase_client.table("attendance_records")\
                .select("*")\
                .eq("student_id", student_id)\
                .order("date", desc=True)\
                .execute()
            
            # Get behavioral records
            behavioral_response = supabase_client.table("behavioral_records")\
                .select("*")\
                .eq("student_id", student_id)\
                .order("date", desc=True)\
                .execute()
            
            return {
                "student": student,
                "academic_records": academic_response.data or [],
                "attendance_records": attendance_response.data or [],
                "behavioral_records": behavioral_response.data or []
            }
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Get student academic data failed: {str(e)}")
            raise DatabaseError(f"Failed to get academic data: {str(e)}")
    
    @staticmethod
    def bulk_import_students(students_data: List[Dict]) -> Dict:
        """
        Bulk import students
        
        Args:
            students_data: List of student records
            
        Returns:
            Import results
        """
        try:
            response = supabase_client.table(StudentService.TABLE_NAME)\
                .insert(students_data)\
                .execute()
            
            logger.info(f"Bulk imported {len(response.data)} students")
            return {
                "imported": len(response.data),
                "data": response.data
            }
            
        except Exception as e:
            logger.error(f"Bulk import failed: {str(e)}")
            raise DatabaseError(f"Failed to import students: {str(e)}")
