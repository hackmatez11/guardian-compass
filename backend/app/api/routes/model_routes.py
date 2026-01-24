"""
ML Model management API routes
"""
from flask import Blueprint, request, g
import pandas as pd
from io import StringIO
from app.services.auth_service import require_auth, require_role
from app.services.ml_service import MLService
from app.utils.response import success_response, error_response
from app.utils.exceptions import ModelError, ValidationError
from app.utils.validators import validate_required_fields
from app.utils.logger import get_logger

logger = get_logger(__name__)
model_bp = Blueprint('models', __name__, url_prefix='/models')


@model_bp.route('/train', methods=['POST'])
@require_auth
@require_role('admin')
def train_model():
    """
    Train a new ML model
    Requires: admin role
    
    Request Body:
        training_data: CSV string or array of objects
        model_type: "logistic_regression" or "random_forest"
        save_model: Whether to save the trained model (default: true)
    """
    try:
        data = request.get_json()
        
        validate_required_fields(data, ['training_data'])
        
        model_type = data.get('model_type', 'random_forest')
        save_model = data.get('save_model', True)
        
        # Parse training data
        if isinstance(data['training_data'], str):
            # CSV string
            training_df = pd.read_csv(StringIO(data['training_data']))
        elif isinstance(data['training_data'], list):
            # Array of objects
            training_df = pd.DataFrame(data['training_data'])
        else:
            raise ValidationError("training_data must be CSV string or array of objects")
        
        # Validate required columns
        if 'dropout' not in training_df.columns:
            raise ValidationError("training_data must contain 'dropout' column")
        
        # Train model
        result = MLService.train_model(
            training_data=training_df,
            model_type=model_type,
            save_model=save_model
        )
        
        return success_response(
            data=result,
            message=f"Model trained successfully. Accuracy: {result['metrics']['accuracy']:.4f}"
        )
        
    except (ValidationError, ModelError) as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Train model error: {str(e)}")
        return error_response("Model training failed", 500)


@model_bp.route('/info', methods=['GET'])
@require_auth
@require_role('admin', 'counselor')
def get_model_info():
    """
    Get information about current model
    Requires: admin or counselor role
    """
    try:
        info = MLService.get_model_info()
        
        return success_response(data=info)
        
    except Exception as e:
        logger.error(f"Get model info error: {str(e)}")
        return error_response("Failed to get model info", 500)


@model_bp.route('/retrain', methods=['POST'])
@require_auth
@require_role('admin')
def retrain_model():
    """
    Retrain model with new semester data
    Requires: admin role
    
    This endpoint fetches recent student data from database,
    combines it with historical data, and retrains the model.
    
    Request Body:
        model_type: Type of model to train (optional)
        semester: Semester data to include (optional)
    """
    try:
        data = request.get_json() or {}
        
        model_type = data.get('model_type', 'random_forest')
        
        # TODO: Implement fetching training data from database
        # For now, return info message
        
        return success_response(
            message="Model retraining endpoint. Implement data fetching logic based on your database schema."
        )
        
    except Exception as e:
        logger.error(f"Retrain model error: {str(e)}")
        return error_response("Model retraining failed", 500)


@model_bp.route('/evaluate', methods=['POST'])
@require_auth
@require_role('admin')
def evaluate_model():
    """
    Evaluate model performance on test data
    Requires: admin role
    
    Request Body:
        test_data: Test dataset (CSV string or array of objects)
    """
    try:
        data = request.get_json()
        
        validate_required_fields(data, ['test_data'])
        
        # Parse test data
        if isinstance(data['test_data'], str):
            test_df = pd.read_csv(StringIO(data['test_data']))
        elif isinstance(data['test_data'], list):
            test_df = pd.DataFrame(data['test_data'])
        else:
            raise ValidationError("test_data must be CSV string or array of objects")
        
        # Get model
        model = MLService.get_model()
        
        if model.model is None:
            raise ModelError("No trained model available")
        
        # Extract features and target
        X = model.extract_features(model.preprocess_data(test_df))
        y_true = test_df['dropout'].map({'Yes': 1, 'No': 0})
        
        # Ensure features match
        for feature in model.feature_names:
            if feature not in X.columns:
                X[feature] = 0
        X = X[model.feature_names]
        
        # Scale and predict
        X_scaled = model.scaler.transform(X)
        y_pred = model.model.predict(X_scaled)
        y_pred_proba = model.model.predict_proba(X_scaled)[:, 1]
        
        # Calculate metrics
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
        
        metrics = {
            'accuracy': float(accuracy_score(y_true, y_pred)),
            'precision': float(precision_score(y_true, y_pred, zero_division=0)),
            'recall': float(recall_score(y_true, y_pred, zero_division=0)),
            'f1_score': float(f1_score(y_true, y_pred, zero_division=0)),
            'roc_auc': float(roc_auc_score(y_true, y_pred_proba))
        }
        
        return success_response(
            data={
                'metrics': metrics,
                'test_samples': len(test_df)
            },
            message="Model evaluation completed"
        )
        
    except (ValidationError, ModelError) as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Evaluate model error: {str(e)}")
        return error_response("Model evaluation failed", 500)


@model_bp.route('/feature-importance', methods=['GET'])
@require_auth
@require_role('admin', 'counselor')
def get_feature_importance():
    """
    Get feature importance from current model
    Requires: admin or counselor role
    """
    try:
        model = MLService.get_model()
        
        if model.model is None:
            raise ModelError("No trained model available")
        
        importance = model.get_feature_importance()
        
        # Sort by importance
        sorted_importance = sorted(
            importance.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return success_response(
            data={
                'feature_importance': dict(sorted_importance),
                'top_features': sorted_importance[:10]
            }
        )
        
    except ModelError as e:
        return error_response(str(e), e.status_code)
    except Exception as e:
        logger.error(f"Get feature importance error: {str(e)}")
        return error_response("Failed to get feature importance", 500)
