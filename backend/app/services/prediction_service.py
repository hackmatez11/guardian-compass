"""
Prediction service for managing dropout predictions
"""
from typing import Dict, List, Optional
from datetime import datetime
from config.supabase import supabase_client
from app.utils.exceptions import NotFoundError, DatabaseError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class PredictionService:
    """Handle prediction data operations"""
    
    TABLE_NAME = "predictions"
    
    @staticmethod
    def create_prediction(prediction_data: Dict) -> Dict:
        """
        Create a new prediction record
        
        Args:
            prediction_data: Prediction information
            
        Returns:
            Created prediction record
        """
        try:
            # Add timestamp
            prediction_data['created_at'] = datetime.utcnow().isoformat()
            
            response = supabase_client.table(PredictionService.TABLE_NAME)\
                .insert(prediction_data)\
                .execute()
            
            if response.data:
                logger.info(f"Prediction created for student: {prediction_data.get('student_id')}")
                return response.data[0]
            
            raise DatabaseError("Failed to create prediction")
            
        except Exception as e:
            logger.error(f"Create prediction failed: {str(e)}")
            raise DatabaseError(f"Failed to create prediction: {str(e)}")
    
    @staticmethod
    def get_prediction(prediction_id: str) -> Dict:
        """
        Get prediction by ID
        
        Args:
            prediction_id: Prediction ID
            
        Returns:
            Prediction record
        """
        try:
            response = supabase_client.table(PredictionService.TABLE_NAME)\
                .select("*")\
                .eq("id", prediction_id)\
                .execute()
            
            if not response.data:
                raise NotFoundError(f"Prediction not found: {prediction_id}")
            
            return response.data[0]
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Get prediction failed: {str(e)}")
            raise DatabaseError(f"Failed to get prediction: {str(e)}")
    
    @staticmethod
    def get_student_predictions(
        student_id: str,
        limit: int = 10
    ) -> List[Dict]:
        """
        Get prediction history for a student
        
        Args:
            student_id: Student ID
            limit: Maximum number of predictions to return
            
        Returns:
            List of prediction records
        """
        try:
            response = supabase_client.table(PredictionService.TABLE_NAME)\
                .select("*")\
                .eq("student_id", student_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            return response.data or []
            
        except Exception as e:
            logger.error(f"Get student predictions failed: {str(e)}")
            raise DatabaseError(f"Failed to get predictions: {str(e)}")
    
    @staticmethod
    def get_latest_prediction(student_id: str) -> Optional[Dict]:
        """
        Get the most recent prediction for a student
        
        Args:
            student_id: Student ID
            
        Returns:
            Latest prediction record or None
        """
        try:
            response = supabase_client.table(PredictionService.TABLE_NAME)\
                .select("*")\
                .eq("student_id", student_id)\
                .order("created_at", desc=True)\
                .limit(1)\
                .execute()
            
            return response.data[0] if response.data else None
            
        except Exception as e:
            logger.error(f"Get latest prediction failed: {str(e)}")
            raise DatabaseError(f"Failed to get latest prediction: {str(e)}")
    
    @staticmethod
    def list_predictions(
        page: int = 1,
        page_size: int = 20,
        risk_level: Optional[str] = None,
        filters: Optional[Dict] = None
    ) -> tuple:
        """
        List predictions with pagination and filters
        
        Args:
            page: Page number
            page_size: Items per page
            risk_level: Filter by risk level (Low/Medium/High)
            filters: Additional filter conditions
            
        Returns:
            Tuple of (predictions list, total count)
        """
        try:
            # Build query
            query = supabase_client.table(PredictionService.TABLE_NAME)\
                .select("*, students(student_id, name, email)", count="exact")
            
            # Apply risk level filter
            if risk_level:
                query = query.eq("risk_level", risk_level)
            
            # Apply additional filters
            if filters:
                for key, value in filters.items():
                    if value is not None:
                        query = query.eq(key, value)
            
            # Apply ordering
            query = query.order("created_at", desc=True)
            
            # Apply pagination
            start = (page - 1) * page_size
            end = start + page_size - 1
            query = query.range(start, end)
            
            # Execute query
            response = query.execute()
            
            return response.data, response.count
            
        except Exception as e:
            logger.error(f"List predictions failed: {str(e)}")
            raise DatabaseError(f"Failed to list predictions: {str(e)}")
    
    @staticmethod
    def get_high_risk_students(limit: int = 50) -> List[Dict]:
        """
        Get students with high dropout risk
        
        Args:
            limit: Maximum number of students to return
            
        Returns:
            List of high-risk predictions
        """
        try:
            response = supabase_client.table(PredictionService.TABLE_NAME)\
                .select("*, students(student_id, name, email)")\
                .eq("risk_level", "High")\
                .order("risk_score", desc=True)\
                .limit(limit)\
                .execute()
            
            return response.data or []
            
        except Exception as e:
            logger.error(f"Get high risk students failed: {str(e)}")
            raise DatabaseError(f"Failed to get high risk students: {str(e)}")
    
    @staticmethod
    def get_prediction_statistics() -> Dict:
        """
        Get overall prediction statistics
        
        Returns:
            Statistics dictionary
        """
        try:
            # Get counts by risk level
            low_count = supabase_client.table(PredictionService.TABLE_NAME)\
                .select("*", count="exact")\
                .eq("risk_level", "Low")\
                .execute().count or 0
            
            medium_count = supabase_client.table(PredictionService.TABLE_NAME)\
                .select("*", count="exact")\
                .eq("risk_level", "Medium")\
                .execute().count or 0
            
            high_count = supabase_client.table(PredictionService.TABLE_NAME)\
                .select("*", count="exact")\
                .eq("risk_level", "High")\
                .execute().count or 0
            
            total_count = low_count + medium_count + high_count
            
            return {
                "total_predictions": total_count,
                "low_risk": low_count,
                "medium_risk": medium_count,
                "high_risk": high_count,
                "low_percentage": (low_count / total_count * 100) if total_count > 0 else 0,
                "medium_percentage": (medium_count / total_count * 100) if total_count > 0 else 0,
                "high_percentage": (high_count / total_count * 100) if total_count > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Get prediction statistics failed: {str(e)}")
            raise DatabaseError(f"Failed to get statistics: {str(e)}")
