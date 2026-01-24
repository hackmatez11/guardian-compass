"""
ML Service for managing model lifecycle and predictions
"""
import os
import pandas as pd
from typing import Dict, List, Optional
from app.ml.model import DropoutPredictionModel
from app.services.prediction_service import PredictionService
from app.services.student_service import StudentService
from app.utils.logger import get_logger
from app.utils.exceptions import ModelError, ValidationError
from config.config import get_config

logger = get_logger(__name__)
config = get_config()


class MLService:
    """
    Service for ML operations
    Manages model instances and prediction workflow
    """
    
    _model_instance: Optional[DropoutPredictionModel] = None
    
    @classmethod
    def get_model(cls, model_type: str = "random_forest") -> DropoutPredictionModel:
        """
        Get or create model instance
        
        Args:
            model_type: Type of model to use
            
        Returns:
            Model instance
        """
        if cls._model_instance is None:
            cls._model_instance = DropoutPredictionModel(model_type=model_type)
            
            # Try to load existing model
            model_path = cls._get_model_path(model_type)
            if os.path.exists(model_path):
                try:
                    cls._model_instance.load(model_path)
                    logger.info(f"Loaded existing model from {model_path}")
                except Exception as e:
                    logger.warning(f"Failed to load model: {str(e)}")
        
        return cls._model_instance
    
    @classmethod
    def _get_model_path(cls, model_type: str) -> str:
        """Get file path for model"""
        model_dir = config.MODEL_PATH
        os.makedirs(model_dir, exist_ok=True)
        return os.path.join(model_dir, f"{model_type}_model.pkl")
    
    @classmethod
    def train_model(
        cls,
        training_data: pd.DataFrame,
        model_type: str = "random_forest",
        save_model: bool = True
    ) -> Dict:
        """
        Train a new model
        
        Args:
            training_data: Training dataset
            model_type: Type of model to train
            save_model: Whether to save the trained model
            
        Returns:
            Training metrics
        """
        try:
            logger.info(f"Training {model_type} model with {len(training_data)} samples")
            
            # Create new model instance
            model = DropoutPredictionModel(model_type=model_type)
            
            # Train
            metrics = model.train(training_data)
            
            # Save if requested
            if save_model:
                model_path = cls._get_model_path(model_type)
                model.save(model_path)
                logger.info(f"Model saved to {model_path}")
            
            # Update class instance
            cls._model_instance = model
            
            return {
                "model_type": model_type,
                "metrics": metrics,
                "model_path": cls._get_model_path(model_type) if save_model else None
            }
            
        except Exception as e:
            logger.error(f"Model training failed: {str(e)}")
            raise ModelError(f"Training failed: {str(e)}")
    
    @classmethod
    def predict_student_dropout(
        cls,
        student_id: str,
        save_prediction: bool = True
    ) -> Dict:
        """
        Predict dropout risk for a single student
        
        Args:
            student_id: Student ID
            save_prediction: Whether to save prediction to database
            
        Returns:
            Prediction result
        """
        try:
            # Get student data
            student_data = StudentService.get_student_academic_data(student_id)
            
            # Prepare data for prediction
            df = cls._prepare_student_data_for_prediction(student_data)
            
            # Get model and predict
            model = cls.get_model()
            predictions = model.predict(df)
            
            if not predictions:
                raise ModelError("Prediction failed")
            
            prediction = predictions[0]
            prediction['student_id'] = student_id
            
            # Save to database if requested
            if save_prediction:
                prediction_record = {
                    'student_id': student_id,
                    'risk_level': prediction['risk_level'],
                    'risk_score': prediction['risk_score'],
                    'contributing_factors': prediction['contributing_factors'],
                    'model_type': model.model_type,
                    'confidence': prediction['confidence']
                }
                saved_prediction = PredictionService.create_prediction(prediction_record)
                prediction['prediction_id'] = saved_prediction['id']
            
            logger.info(f"Prediction completed for student {student_id}: {prediction['risk_level']}")
            
            return prediction
            
        except Exception as e:
            logger.error(f"Prediction failed for student {student_id}: {str(e)}")
            raise ModelError(f"Prediction failed: {str(e)}")
    
    @classmethod
    def predict_batch(
        cls,
        student_ids: List[str],
        save_predictions: bool = True
    ) -> List[Dict]:
        """
        Predict dropout risk for multiple students
        
        Args:
            student_ids: List of student IDs
            save_predictions: Whether to save predictions to database
            
        Returns:
            List of prediction results
        """
        try:
            logger.info(f"Batch prediction for {len(student_ids)} students")
            
            results = []
            
            for student_id in student_ids:
                try:
                    prediction = cls.predict_student_dropout(
                        student_id,
                        save_prediction=save_predictions
                    )
                    results.append(prediction)
                except Exception as e:
                    logger.error(f"Prediction failed for student {student_id}: {str(e)}")
                    results.append({
                        'student_id': student_id,
                        'error': str(e)
                    })
            
            return results
            
        except Exception as e:
            logger.error(f"Batch prediction failed: {str(e)}")
            raise ModelError(f"Batch prediction failed: {str(e)}")
    
    @classmethod
    def _prepare_student_data_for_prediction(cls, student_data: Dict) -> pd.DataFrame:
        """
        Convert student data to DataFrame format for prediction
        
        Args:
            student_data: Student data from database
            
        Returns:
            DataFrame ready for prediction
        """
        student = student_data['student']
        academic_records = student_data.get('academic_records', [])
        attendance_records = student_data.get('attendance_records', [])
        behavioral_records = student_data.get('behavioral_records', [])
        
        # Calculate aggregated features
        data = {
            'student_id': student['student_id'],
            'gpa': student.get('gpa', 0),
            'current_gpa': academic_records[0].get('gpa', 0) if academic_records else 0,
            'previous_gpa': academic_records[1].get('gpa', 0) if len(academic_records) > 1 else 0,
            'attendance_rate': cls._calculate_attendance_rate(attendance_records),
            'absences': len([r for r in attendance_records if r.get('status') == 'absent']),
            'participation_score': student.get('participation_score', 0),
            'assignment_completion_rate': cls._calculate_completion_rate(academic_records),
            'disciplinary_incidents': len(behavioral_records),
            'financial_aid': student.get('financial_aid', 'No'),
            'parent_education_level': student.get('parent_education_level', 'Unknown'),
            'credits_enrolled': student.get('credits_enrolled', 0),
            'failed_courses': len([r for r in academic_records if r.get('grade', 'A') == 'F']),
            'motivation_score': student.get('motivation_score', 5),
            'stress_level': student.get('stress_level', 5)
        }
        
        return pd.DataFrame([data])
    
    @staticmethod
    def _calculate_attendance_rate(attendance_records: List[Dict]) -> float:
        """Calculate attendance rate from records"""
        if not attendance_records:
            return 1.0
        
        present = len([r for r in attendance_records if r.get('status') == 'present'])
        total = len(attendance_records)
        
        return present / total if total > 0 else 1.0
    
    @staticmethod
    def _calculate_completion_rate(academic_records: List[Dict]) -> float:
        """Calculate assignment completion rate"""
        if not academic_records:
            return 1.0
        
        completed = sum(r.get('assignments_completed', 0) for r in academic_records)
        total = sum(r.get('total_assignments', 1) for r in academic_records)
        
        return completed / total if total > 0 else 1.0
    
    @classmethod
    def get_model_info(cls) -> Dict:
        """
        Get information about current model
        
        Returns:
            Model metadata
        """
        try:
            model = cls.get_model()
            
            if model.model is None:
                return {
                    "status": "not_trained",
                    "message": "No trained model available"
                }
            
            return {
                "status": "trained",
                "metadata": model.model_metadata,
                "feature_importances": model.get_feature_importance()
            }
            
        except Exception as e:
            logger.error(f"Get model info failed: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
