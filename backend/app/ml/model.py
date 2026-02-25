"""
ML Model Manager for dropout prediction
Handles model training, prediction, and management
"""
import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from imblearn.over_sampling import SMOTE
from config.config import get_config
from app.utils.logger import get_logger
from app.utils.exceptions import ModelError

logger = get_logger(__name__)
config = get_config()


class DropoutPredictionModel:
    """
    Machine Learning model for dropout prediction
    Supports Logistic Regression and Random Forest algorithms
    """
    
    def __init__(self, model_type: str = "random_forest"):
        """
        Initialize model
        
        Args:
            model_type: Type of model ("logistic_regression" or "random_forest")
        """
        self.model_type = model_type
        self.model = None
        self.scaler = StandardScaler()
        self.feature_names = []
        self.model_metadata = {}
        
        # Initialize model based on type
        if model_type == "logistic_regression":
            self.model = LogisticRegression(
                max_iter=1000,
                random_state=42,
                class_weight='balanced'
            )
        elif model_type == "random_forest":
            self.model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                class_weight='balanced',
                n_jobs=-1
            )
        else:
            raise ModelError(f"Unknown model type: {model_type}")
    
    def preprocess_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Preprocess input data
        
        Args:
            data: Raw student data
            
        Returns:
            Preprocessed data
        """
        df = data.copy()
        
        # Handle missing values
        numeric_columns = df.select_dtypes(include=[np.number]).columns
        df[numeric_columns] = df[numeric_columns].fillna(df[numeric_columns].mean())
        
        # Handle categorical variables
        categorical_columns = df.select_dtypes(include=['object']).columns
        for col in categorical_columns:
            if col not in ['student_id', 'dropout']:
                df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else 'Unknown')
        
        return df
    
    def extract_features(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Extract and engineer features from student data
        
        Args:
            data: Preprocessed data
            
        Returns:
            Feature matrix
        """
        features = pd.DataFrame()
        
        # Academic features
        if 'gpa' in data.columns:
            features['gpa'] = data['gpa']
        if 'current_gpa' in data.columns:
            features['current_gpa'] = data['current_gpa']
        if 'previous_gpa' in data.columns:
            features['previous_gpa'] = data['previous_gpa']
            features['gpa_trend'] = data['current_gpa'] - data['previous_gpa']
        
        # Attendance features
        if 'attendance_rate' in data.columns:
            features['attendance_rate'] = data['attendance_rate']
        if 'absences' in data.columns:
            features['absences'] = data['absences']
        
        # Engagement features
        if 'participation_score' in data.columns:
            features['participation_score'] = data['participation_score']
        if 'assignment_completion_rate' in data.columns:
            features['assignment_completion_rate'] = data['assignment_completion_rate']
        
        # Behavioral features
        if 'disciplinary_incidents' in data.columns:
            features['disciplinary_incidents'] = data['disciplinary_incidents']
        
        # Socioeconomic features
        if 'financial_aid' in data.columns:
            features['financial_aid'] = data['financial_aid'].map({'Yes': 1, 'No': 0})
        if 'parent_education_level' in data.columns:
            features['parent_education_level'] = pd.Categorical(
                data['parent_education_level']
            ).codes
        
        # Course-related features
        if 'credits_enrolled' in data.columns:
            features['credits_enrolled'] = data['credits_enrolled']
        if 'failed_courses' in data.columns:
            features['failed_courses'] = data['failed_courses']
        
        # Survey/psychological features
        if 'motivation_score' in data.columns:
            features['motivation_score'] = data['motivation_score']
        if 'stress_level' in data.columns:
            features['stress_level'] = data['stress_level']
        
        return features
    
    def train(
        self,
        training_data: pd.DataFrame,
        target_column: str = 'dropout',
        validation_split: float = 0.2
    ) -> Dict:
        """
        Train the model
        
        Args:
            training_data: Training dataset
            target_column: Name of target column
            validation_split: Proportion of data for validation
            
        Returns:
            Training metrics
        """
        try:
            logger.info(f"Starting model training with {len(training_data)} samples")
            
            # Preprocess data
            preprocessed_data = self.preprocess_data(training_data)
            
            # Extract features
            X = self.extract_features(preprocessed_data)
            y = preprocessed_data[target_column].map({'Yes': 1, 'No': 0})
            
            self.feature_names = X.columns.tolist()
            
            # Split data
            X_train, X_val, y_train, y_val = train_test_split(
                X, y,
                test_size=validation_split,
                random_state=42,
                stratify=y
            )
            
            # Handle class imbalance with SMOTE
            smote = SMOTE(random_state=42)
            X_train_balanced, y_train_balanced = smote.fit_resample(X_train, y_train)
            
            # Scale features
            X_train_scaled = self.scaler.fit_transform(X_train_balanced)
            X_val_scaled = self.scaler.transform(X_val)
            
            # Train model
            self.model.fit(X_train_scaled, y_train_balanced)
            
            # Validate
            y_pred = self.model.predict(X_val_scaled)
            y_pred_proba = self.model.predict_proba(X_val_scaled)[:, 1]
            
            # Calculate metrics
            metrics = {
                'accuracy': accuracy_score(y_val, y_pred),
                'precision': precision_score(y_val, y_pred, zero_division=0),
                'recall': recall_score(y_val, y_pred, zero_division=0),
                'f1_score': f1_score(y_val, y_pred, zero_division=0),
                'roc_auc': roc_auc_score(y_val, y_pred_proba)
            }
            
            # Cross-validation score
            cv_scores = cross_val_score(self.model, X_train_scaled, y_train_balanced, cv=5)
            metrics['cv_mean'] = cv_scores.mean()
            metrics['cv_std'] = cv_scores.std()
            
            # Store metadata
            self.model_metadata = {
                'model_type': self.model_type,
                'trained_at': datetime.utcnow().isoformat(),
                'training_samples': len(training_data),
                'feature_count': len(self.feature_names),
                'features': self.feature_names,
                'metrics': metrics
            }
            
            logger.info(f"Model training completed. Accuracy: {metrics['accuracy']:.4f}")
            
            return metrics
            
        except Exception as e:
            logger.error(f"Model training failed: {str(e)}")
            raise ModelError(f"Training failed: {str(e)}")
    
    def predict(self, student_data: pd.DataFrame) -> List[Dict]:
        """
        Make predictions for students
        
        Args:
            student_data: Student data
            
        Returns:
            List of predictions with risk levels and scores
        """
        try:
            if self.model is None:
                raise ModelError("Model not trained or loaded")
            
            # Preprocess and extract features
            preprocessed_data = self.preprocess_data(student_data)
            X = self.extract_features(preprocessed_data)
            
            # Ensure features match training features
            for feature in self.feature_names:
                if feature not in X.columns:
                    X[feature] = 0
            X = X[self.feature_names]
            
            # Scale features
            X_scaled = self.scaler.transform(X)
            
            # Predict
            predictions = self.model.predict(X_scaled)
            probabilities = self.model.predict_proba(X_scaled)[:, 1]
            
            # Get feature importances
            feature_importances = self.get_feature_importance()
            
            # Build results
            results = []
            for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
                # Determine risk level based on probability
                if prob < 0.33:
                    risk_level = "low"
                elif prob < 0.67:
                    risk_level = "medium"
                else:
                    risk_level = "high"
                
                # Get top contributing factors for this student
                student_features = X.iloc[i].to_dict()
                contributing_factors = self._get_contributing_factors(
                    student_features,
                    feature_importances
                )
                
                results.append({
                    'dropout_prediction': bool(pred),
                    'risk_score': float(prob),
                    'risk_level': risk_level,
                    'contributing_factors': contributing_factors,
                    'confidence': float(max(probabilities[i], 1 - probabilities[i]))
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Prediction failed: {str(e)}")
            raise ModelError(f"Prediction failed: {str(e)}")
    
    def get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance scores"""
        if self.model is None:
            return {}
        
        if hasattr(self.model, 'feature_importances_'):
            # For Random Forest
            importances = self.model.feature_importances_
        elif hasattr(self.model, 'coef_'):
            # For Logistic Regression
            importances = np.abs(self.model.coef_[0])
        else:
            return {}
        
        return dict(zip(self.feature_names, importances))
    
    def _get_contributing_factors(
        self,
        student_features: Dict,
        feature_importances: Dict,
        top_n: int = 5
    ) -> List[Dict]:
        """Get top contributing factors for a prediction"""
        factors = []
        
        # Calculate weighted contribution
        for feature, value in student_features.items():
            importance = feature_importances.get(feature, 0)
            contribution = importance * abs(value)
            
            factors.append({
                'factor': feature,
                'value': value,
                'importance': importance,
                'contribution': contribution
            })
        
        # Sort by contribution and return top N
        factors.sort(key=lambda x: x['contribution'], reverse=True)
        return factors[:top_n]
    
    def save(self, filepath: str) -> None:
        """Save model to disk"""
        try:
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'feature_names': self.feature_names,
                'metadata': self.model_metadata
            }
            
            joblib.dump(model_data, filepath)
            logger.info(f"Model saved to {filepath}")
            
        except Exception as e:
            logger.error(f"Failed to save model: {str(e)}")
            raise ModelError(f"Failed to save model: {str(e)}")
    
    def load(self, filepath: str) -> None:
        """Load model from disk"""
        try:
            model_data = joblib.load(filepath)
            
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.feature_names = model_data['feature_names']
            self.model_metadata = model_data['metadata']
            
            logger.info(f"Model loaded from {filepath}")
            
        except Exception as e:
            logger.error(f"Failed to load model: {str(e)}")
            raise ModelError(f"Failed to load model: {str(e)}")
