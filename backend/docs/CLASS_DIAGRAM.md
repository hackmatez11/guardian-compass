# Class Diagram and Architecture

## Core Classes and Their Relationships

### Class Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                         Flask Application                        │
│                         (app/__init__.py)                       │
└────────────┬───────────────────────────────────────────────────┘
             │
             ├───► Blueprints (API Routes)
             │     ├─ AuthBlueprint
             │     ├─ StudentBlueprint
             │     ├─ PredictionBlueprint
             │     ├─ CounselingBlueprint
             │     └─ ModelBlueprint
             │
             ├───► Services (Business Logic)
             │     ├─ AuthService
             │     ├─ StudentService
             │     ├─ PredictionService
             │     ├─ CounselingService
             │     └─ MLService
             │
             ├───► ML Components
             │     └─ DropoutPredictionModel
             │
             ├───► Utilities
             │     ├─ Logger
             │     ├─ Validators
             │     ├─ Exceptions
             │     └─ Response Helpers
             │
             └───► Configuration
                   ├─ Config
                   └─ SupabaseClient
```

## Detailed Class Diagrams

### 1. Authentication Module

```
┌─────────────────────────────────────────┐
│           AuthService                   │
├─────────────────────────────────────────┤
│ + sign_up(email, password, user_data)  │
│ + sign_in(email, password)             │
│ + sign_out(access_token)               │
│ + get_user_from_token(access_token)    │
│ + refresh_session(refresh_token)       │
│ + reset_password_request(email)        │
│ + update_password(token, new_password) │
└─────────────────────────────────────────┘
                    │
                    │ uses
                    ▼
┌─────────────────────────────────────────┐
│        SupabaseClient                   │
├─────────────────────────────────────────┤
│ - _instance: Client                     │
│ - _service_instance: Client             │
├─────────────────────────────────────────┤
│ + get_client(): Client                  │
│ + get_service_client(): Client          │
└─────────────────────────────────────────┘
```

### 2. Student Management Module

```
┌─────────────────────────────────────────────────┐
│              StudentService                      │
├─────────────────────────────────────────────────┤
│ - TABLE_NAME: str = "students"                  │
├─────────────────────────────────────────────────┤
│ + create_student(student_data): Dict            │
│ + get_student(student_id): Dict                 │
│ + update_student(student_id, data): Dict        │
│ + delete_student(student_id): None              │
│ + list_students(page, size, filters): Tuple     │
│ + get_student_academic_data(student_id): Dict   │
│ + bulk_import_students(data): Dict              │
└─────────────────────────────────────────────────┘
                         │
                         │ interacts with
                         ▼
┌─────────────────────────────────────────────────┐
│             Student (Data Model)                 │
├─────────────────────────────────────────────────┤
│ - id: UUID                                      │
│ - student_id: str                               │
│ - name: str                                     │
│ - email: str                                    │
│ - department: str                               │
│ - year: int                                     │
│ - gpa: float                                    │
│ - attendance_rate: float                        │
│ - participation_score: int                      │
│ - credits_enrolled: int                         │
│ - financial_aid: str                            │
│ - parent_education_level: str                   │
│ - motivation_score: int                         │
│ - stress_level: int                             │
│ - created_at: timestamp                         │
│ - updated_at: timestamp                         │
└─────────────────────────────────────────────────┘
```

### 3. ML Prediction Module

```
┌──────────────────────────────────────────────────────────────┐
│                    MLService                                  │
├──────────────────────────────────────────────────────────────┤
│ - _model_instance: DropoutPredictionModel                    │
├──────────────────────────────────────────────────────────────┤
│ + get_model(model_type): DropoutPredictionModel              │
│ + train_model(data, model_type, save): Dict                  │
│ + predict_student_dropout(student_id, save): Dict            │
│ + predict_batch(student_ids, save): List[Dict]               │
│ + get_model_info(): Dict                                     │
│ - _prepare_student_data_for_prediction(data): DataFrame      │
│ - _calculate_attendance_rate(records): float                 │
│ - _calculate_completion_rate(records): float                 │
└──────────────────────────────────────────────────────────────┘
                         │ uses
                         ▼
┌──────────────────────────────────────────────────────────────┐
│            DropoutPredictionModel                             │
├──────────────────────────────────────────────────────────────┤
│ - model_type: str                                            │
│ - model: Classifier                                          │
│ - scaler: StandardScaler                                     │
│ - feature_names: List[str]                                   │
│ - model_metadata: Dict                                       │
├──────────────────────────────────────────────────────────────┤
│ + __init__(model_type)                                       │
│ + preprocess_data(data): DataFrame                           │
│ + extract_features(data): DataFrame                          │
│ + train(training_data, target, split): Dict                  │
│ + predict(student_data): List[Dict]                          │
│ + get_feature_importance(): Dict                             │
│ + save(filepath): None                                       │
│ + load(filepath): None                                       │
│ - _get_contributing_factors(features, importance): List      │
└──────────────────────────────────────────────────────────────┘
                         │
                         │ contains
                         ▼
┌──────────────────────────────────────────────────────────────┐
│          ML Models (scikit-learn)                            │
├──────────────────────────────────────────────────────────────┤
│ • RandomForestClassifier                                     │
│   - n_estimators: 100                                        │
│   - max_depth: 10                                            │
│   - class_weight: balanced                                   │
│                                                              │
│ • LogisticRegression                                         │
│   - max_iter: 1000                                           │
│   - class_weight: balanced                                   │
└──────────────────────────────────────────────────────────────┘
```

### 4. Prediction Service Module

```
┌─────────────────────────────────────────────────┐
│           PredictionService                      │
├─────────────────────────────────────────────────┤
│ - TABLE_NAME: str = "predictions"               │
├─────────────────────────────────────────────────┤
│ + create_prediction(data): Dict                 │
│ + get_prediction(prediction_id): Dict           │
│ + get_student_predictions(student_id): List     │
│ + get_latest_prediction(student_id): Dict       │
│ + list_predictions(page, size, level): Tuple    │
│ + get_high_risk_students(limit): List           │
│ + get_prediction_statistics(): Dict             │
└─────────────────────────────────────────────────┘
                         │
                         │ manages
                         ▼
┌─────────────────────────────────────────────────┐
│          Prediction (Data Model)                 │
├─────────────────────────────────────────────────┤
│ - id: UUID                                      │
│ - student_id: str                               │
│ - risk_level: str (Low/Medium/High)             │
│ - risk_score: float (0-1)                       │
│ - contributing_factors: JSONB                   │
│ - model_type: str                               │
│ - confidence: float                             │
│ - created_at: timestamp                         │
└─────────────────────────────────────────────────┘
```

### 5. Counseling Module

```
┌─────────────────────────────────────────────────┐
│         CounselingService                        │
├─────────────────────────────────────────────────┤
│ - TABLE_NAME: str = "counseling_sessions"      │
│ - RECOMMENDATIONS_TABLE: str                    │
├─────────────────────────────────────────────────┤
│ + create_session(data): Dict                    │
│ + get_session(session_id): Dict                 │
│ + update_session(session_id, data): Dict        │
│ + get_student_sessions(student_id): List        │
│ + list_sessions(page, size, filters): Tuple     │
│ + create_recommendation(data): Dict             │
│ + get_student_recommendations(student_id): List │
│ + update_recommendation(rec_id, data): Dict     │
│ + get_pending_followups(counselor_id): List     │
└─────────────────────────────────────────────────┘
                         │
                         │ manages
                         ▼
┌─────────────────────────────────────────────────┐
│      CounselingSession (Data Model)              │
├─────────────────────────────────────────────────┤
│ - id: UUID                                      │
│ - student_id: str                               │
│ - counselor_id: UUID                            │
│ - session_type: str                             │
│ - session_date: timestamp                       │
│ - notes: text                                   │
│ - requires_followup: bool                       │
│ - followup_date: date                           │
│ - created_at: timestamp                         │
│ - updated_at: timestamp                         │
└─────────────────────────────────────────────────┘
                         │
                         │ has many
                         ▼
┌─────────────────────────────────────────────────┐
│  CounselingRecommendation (Data Model)           │
├─────────────────────────────────────────────────┤
│ - id: UUID                                      │
│ - student_id: str                               │
│ - counselor_id: UUID                            │
│ - recommendation_type: str                      │
│ - description: text                             │
│ - status: str (pending/in_progress/completed)   │
│ - created_at: timestamp                         │
│ - updated_at: timestamp                         │
└─────────────────────────────────────────────────┘
```

### 6. Utilities Module

```
┌─────────────────────────────────────────────────┐
│              AppException                        │
├─────────────────────────────────────────────────┤
│ - message: str                                  │
│ - status_code: int                              │
│ - payload: Dict                                 │
├─────────────────────────────────────────────────┤
│ + __init__(message, status_code, payload)       │
│ + to_dict(): Dict                               │
└─────────────────────────────────────────────────┘
                         ▲
                         │ inherits
        ┌────────────────┼────────────────┐
        │                │                │
┌───────┴────────┐ ┌─────┴─────────┐ ┌───┴────────────┐
│Authentication  │ │Authorization  │ │  Validation    │
│    Error       │ │    Error      │ │     Error      │
├────────────────┤ ├───────────────┤ ├────────────────┤
│status: 401     │ │status: 403    │ │status: 400     │
└────────────────┘ └───────────────┘ └────────────────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────┴────────┐ ┌─────┴─────────┐ ┌───┴────────────┐
│  NotFound      │ │   Conflict    │ │    Model       │
│    Error       │ │    Error      │ │     Error      │
├────────────────┤ ├───────────────┤ ├────────────────┤
│status: 404     │ │status: 409    │ │status: 500     │
└────────────────┘ └───────────────┘ └────────────────┘
```

```
┌─────────────────────────────────────────────────┐
│              Logger                              │
├─────────────────────────────────────────────────┤
│ + setup_logging(app): Logger                    │
│ + get_logger(name): Logger                      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│            Validators                            │
├─────────────────────────────────────────────────┤
│ + validate_email(email): bool                   │
│ + validate_password(password): Tuple            │
│ + validate_required_fields(data, fields): None  │
│ + validate_enum(value, allowed, name): None     │
│ + validate_range(value, min, max, name): None   │
│ + sanitize_string(value): str                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│          Response Helpers                        │
├─────────────────────────────────────────────────┤
│ + success_response(data, message, code): Tuple  │
│ + error_response(message, code, errors): Tuple  │
│ + paginated_response(data, page, size): Tuple   │
└─────────────────────────────────────────────────┘
```

### 7. Configuration Module

```
┌─────────────────────────────────────────────────┐
│                 Config                           │
├─────────────────────────────────────────────────┤
│ + SECRET_KEY: str                               │
│ + DEBUG: bool                                   │
│ + SUPABASE_URL: str                             │
│ + SUPABASE_KEY: str                             │
│ + SUPABASE_SERVICE_KEY: str                     │
│ + DATABASE_URL: str                             │
│ + API_VERSION: str                              │
│ + API_PREFIX: str                               │
│ + CORS_ORIGINS: List[str]                       │
│ + RATE_LIMIT_ENABLED: bool                      │
│ + RATE_LIMIT_DEFAULT: str                       │
│ + MODEL_PATH: str                               │
│ + MODEL_RETRAIN_THRESHOLD: float                │
│ + LOG_LEVEL: str                                │
│ + LOG_FILE: str                                 │
│ + JWT_ALGORITHM: str                            │
│ + JWT_EXPIRATION_HOURS: int                     │
│ + PASSWORD_MIN_LENGTH: int                      │
└─────────────────────────────────────────────────┘
                         ▲
                         │ extends
        ┌────────────────┼────────────────┐
        │                │                │
┌───────┴────────┐ ┌─────┴─────────┐ ┌───┴────────────┐
│Development     │ │   Testing     │ │  Production    │
│   Config       │ │    Config     │ │     Config     │
├────────────────┤ ├───────────────┤ ├────────────────┤
│DEBUG: True     │ │TESTING: True  │ │DEBUG: False    │
└────────────────┘ └───────────────┘ └────────────────┘
```

## Relationships and Dependencies

### Service Layer Dependencies

```
AuthService ──────────► SupabaseClient
                             ▲
                             │
StudentService ──────────────┤
                             │
PredictionService ───────────┤
                             │
CounselingService ───────────┤
                             │
MLService ───────────────────┘
     │
     └──────────► DropoutPredictionModel
     │
     └──────────► StudentService
     │
     └──────────► PredictionService
```

### API Routes Dependencies

```
auth_routes.py ────────► AuthService
                              │
student_routes.py ────► StudentService
                              │
prediction_routes.py ──► MLService ────► PredictionService
                              │
counseling_routes.py ──► CounselingService
                              │
model_routes.py ───────► MLService
```

### Decorator Chain

```
@auth_bp.route('/endpoint')
@require_auth                    ← Validates JWT token
@require_role('admin')          ← Validates user role
def protected_endpoint():
    # Access g.user (set by decorators)
    pass
```

## Key Design Patterns

### 1. Singleton Pattern
- **SupabaseClient**: Single instance shared across application
- **MLService**: Single model instance for predictions

### 2. Factory Pattern
- **create_app()**: Flask application factory
- **get_config()**: Configuration factory based on environment

### 3. Service Layer Pattern
- Business logic separated from routes
- Services interact with data layer
- Routes orchestrate service calls

### 4. Decorator Pattern
- **@require_auth**: Authentication decorator
- **@require_role**: Authorization decorator
- **@app.errorhandler**: Error handling decorator

### 5. Repository Pattern
- Services act as repositories
- Abstract database operations
- Consistent interface for data access

## Component Interactions

```
Request Flow:
    Client Request
         │
         ▼
    Flask Route (API Layer)
         │
         ├──► @require_auth (Validate Token)
         │         │
         │         ▼
         │    @require_role (Check Permission)
         │         │
         ▼         ▼
    Service Layer (Business Logic)
         │
         ├──► Validators (Input Validation)
         │
         ├──► Data Layer (Database/Model Operations)
         │
         ├──► Logger (Logging)
         │
         └──► Response Helper (Format Response)
         │
         ▼
    JSON Response
```

## Data Models Summary

| Model | Primary Key | Foreign Keys | Indexes |
|-------|-------------|--------------|---------|
| students | id (UUID) | - | student_id |
| academic_records | id (UUID) | student_id | student_id |
| attendance_records | id (UUID) | student_id | student_id |
| behavioral_records | id (UUID) | student_id | student_id |
| predictions | id (UUID) | student_id | student_id, risk_level |
| counseling_sessions | id (UUID) | student_id, counselor_id | student_id, counselor_id |
| counseling_recommendations | id (UUID) | student_id, counselor_id | student_id |

## Error Handling Flow

```
Exception Occurs
     │
     ▼
Custom Exception (AppException subclass)
     │
     ▼
Flask Error Handler (@app.errorhandler)
     │
     ├──► Logger (Log Error)
     │
     └──► error_response() (Format Error)
     │
     ▼
JSON Error Response (with status code)
```

This class diagram and architecture documentation provides a comprehensive view of the system's structure, relationships, and design patterns implemented in the backend.
