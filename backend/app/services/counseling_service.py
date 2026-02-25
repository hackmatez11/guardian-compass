"""
Counseling service for managing counseling sessions and recommendations
"""
from typing import Dict, List, Optional
from datetime import datetime
from config.supabase import supabase_client
from app.utils.exceptions import NotFoundError, DatabaseError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class CounselingService:
    """Handle counseling operations"""
    
    TABLE_NAME = "counseling_sessions"
    RECOMMENDATIONS_TABLE = "counseling_recommendations"
    
    @staticmethod
    def create_session(session_data: Dict) -> Dict:
        """
        Create a new counseling session
        
        Args:
            session_data: Session information
            
        Returns:
            Created session record
        """
        try:
            session_data['created_at'] = datetime.utcnow().isoformat()
            
            response = supabase_client.table(CounselingService.TABLE_NAME)\
                .insert(session_data)\
                .execute()
            
            if response.data:
                logger.info(f"Counseling session created for student: {session_data.get('student_id')}")
                return response.data[0]
            
            raise DatabaseError("Failed to create counseling session")
            
        except Exception as e:
            logger.error(f"Create session failed: {str(e)}")
            raise DatabaseError(f"Failed to create session: {str(e)}")
    
    @staticmethod
    def get_session(session_id: str) -> Dict:
        """
        Get counseling session by ID
        
        Args:
            session_id: Session ID
            
        Returns:
            Session record
        """
        try:
            response = supabase_client.table(CounselingService.TABLE_NAME)\
                .select("*")\
                .eq("id", session_id)\
                .execute()
            
            if not response.data:
                raise NotFoundError(f"Session not found: {session_id}")
            
            return response.data[0]
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Get session failed: {str(e)}")
            raise DatabaseError(f"Failed to get session: {str(e)}")
    
    @staticmethod
    def update_session(session_id: str, update_data: Dict) -> Dict:
        """
        Update counseling session
        
        Args:
            session_id: Session ID
            update_data: Fields to update
            
        Returns:
            Updated session record
        """
        try:
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            response = supabase_client.table(CounselingService.TABLE_NAME)\
                .update(update_data)\
                .eq("id", session_id)\
                .execute()
            
            if not response.data:
                raise NotFoundError(f"Session not found: {session_id}")
            
            logger.info(f"Session updated: {session_id}")
            return response.data[0]
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Update session failed: {str(e)}")
            raise DatabaseError(f"Failed to update session: {str(e)}")
    
    @staticmethod
    def get_student_sessions(
        student_id: str,
        limit: int = 20
    ) -> List[Dict]:
        """
        Get counseling sessions for a student
        
        Args:
            student_id: Student ID
            limit: Maximum number of sessions
            
        Returns:
            List of session records
        """
        try:
            response = supabase_client.table(CounselingService.TABLE_NAME)\
                .select("*")\
                .eq("student_id", student_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            return response.data or []
            
        except Exception as e:
            logger.error(f"Get student sessions failed: {str(e)}")
            raise DatabaseError(f"Failed to get sessions: {str(e)}")
    
    @staticmethod
    def create_recommendation(recommendation_data: Dict) -> Dict:
        """
        Create a counseling recommendation
        
        Args:
            recommendation_data: Recommendation information
            
        Returns:
            Created recommendation record
        """
        try:
            recommendation_data['created_at'] = datetime.utcnow().isoformat()
            
            response = supabase_client.table(CounselingService.RECOMMENDATIONS_TABLE)\
                .insert(recommendation_data)\
                .execute()
            
            if response.data:
                logger.info(f"Recommendation created for student: {recommendation_data.get('student_id')}")
                return response.data[0]
            
            raise DatabaseError("Failed to create recommendation")
            
        except Exception as e:
            logger.error(f"Create recommendation failed: {str(e)}")
            raise DatabaseError(f"Failed to create recommendation: {str(e)}")
    
    @staticmethod
    def get_student_recommendations(
        student_id: str,
        status: Optional[str] = None
    ) -> List[Dict]:
        """
        Get recommendations for a student
        
        Args:
            student_id: Student ID
            status: Filter by status (pending/in_progress/completed)
            
        Returns:
            List of recommendation records
        """
        try:
            query = supabase_client.table(CounselingService.RECOMMENDATIONS_TABLE)\
                .select("*")\
                .eq("student_id", student_id)
            
            if status:
                query = query.eq("status", status)
            
            response = query.order("created_at", desc=True).execute()
            
            return response.data or []
            
        except Exception as e:
            logger.error(f"Get student recommendations failed: {str(e)}")
            raise DatabaseError(f"Failed to get recommendations: {str(e)}")
    
    @staticmethod
    def update_recommendation(recommendation_id: str, update_data: Dict) -> Dict:
        """
        Update recommendation status/details
        
        Args:
            recommendation_id: Recommendation ID
            update_data: Fields to update
            
        Returns:
            Updated recommendation record
        """
        try:
            update_data['updated_at'] = datetime.utcnow().isoformat()
            
            response = supabase_client.table(CounselingService.RECOMMENDATIONS_TABLE)\
                .update(update_data)\
                .eq("id", recommendation_id)\
                .execute()
            
            if not response.data:
                raise NotFoundError(f"Recommendation not found: {recommendation_id}")
            
            logger.info(f"Recommendation updated: {recommendation_id}")
            return response.data[0]
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Update recommendation failed: {str(e)}")
            raise DatabaseError(f"Failed to update recommendation: {str(e)}")
    
    @staticmethod
    def list_sessions(
        page: int = 1,
        page_size: int = 20,
        filters: Optional[Dict] = None
    ) -> tuple:
        """
        List counseling sessions with pagination
        
        Args:
            page: Page number
            page_size: Items per page
            filters: Filter conditions
            
        Returns:
            Tuple of (sessions list, total count)
        """
        try:
            query = supabase_client.table(CounselingService.TABLE_NAME)\
                .select("*, students(student_id, full_name, email)", count="exact")
            
            if filters:
                for key, value in filters.items():
                    if value is not None:
                        query = query.eq(key, value)
            
            query = query.order("created_at", desc=True)
            
            start = (page - 1) * page_size
            end = start + page_size - 1
            query = query.range(start, end)
            
            response = query.execute()
            
            return response.data, response.count
            
        except Exception as e:
            logger.error(f"List sessions failed: {str(e)}")
            raise DatabaseError(f"Failed to list sessions: {str(e)}")
    
    @staticmethod
    def get_pending_followups(counselor_id: Optional[str] = None) -> List[Dict]:
        """
        Get sessions requiring follow-up
        
        Args:
            counselor_id: Filter by counselor ID (optional)
            
        Returns:
            List of sessions needing follow-up
        """
        try:
            # Get sessions with follow_up_date set (not null)
            query = supabase_client.table(CounselingService.TABLE_NAME)\
                .select("*, students(student_id, full_name, email)")\
                .filter("follow_up_date", "is.not", "null")
            
            if counselor_id:
                query = query.eq("counselor_id", counselor_id)
            
            # Order by follow_up_date in ascending order (earliest first)
            response = query.order("follow_up_date", desc=False).execute()
            
            return response.data or []
            
        except Exception as e:
            logger.error(f"Get pending followups failed: {str(e)}")
            raise DatabaseError(f"Failed to get followups: {str(e)}")
