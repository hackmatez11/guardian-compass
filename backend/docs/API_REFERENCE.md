# API Reference Guide

## Base URL

```
Development: http://localhost:5000/api/v1
Production: https://your-domain.com/api/v1
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## Common Response Format

### Success Response
```json
{
    "success": true,
    "message": "Operation successful",
    "data": { ... }
}
```

### Error Response
```json
{
    "success": false,
    "error": true,
    "message": "Error description",
    "errors": { ... }
}
```

### Paginated Response
```json
{
    "success": true,
    "message": "Success",
    "data": [ ... ],
    "meta": {
        "page": 1,
        "page_size": 20,
        "total": 100,
        "total_pages": 5,
        "has_next": true,
        "has_prev": false
    }
}
```

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/signup`

**Access:** Public

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "SecurePassword123",
    "role": "student",
    "name": "John Doe",
    "profile": {
        "phone": "+1234567890",
        "department": "Computer Science"
    }
}
```

**Validation Rules:**
- `email`: Valid email format, required
- `password`: Min 8 chars, 1 uppercase, 1 lowercase, 1 digit, required
- `role`: One of [student, counselor, admin], required
- `name`: Optional string
- `profile`: Optional object

**Response:** `201 Created`
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": "uuid",
            "email": "user@example.com",
            "role": "student"
        },
        "session": {
            "access_token": "eyJhbGciOiJIUzI1NiIs..."
        }
    }
}
```

---

### Sign In

Authenticate user and receive access token.

**Endpoint:** `POST /auth/signin`

**Access:** Public

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "SecurePassword123"
}
```

**Response:** `200 OK`
```json
{
    "success": true,
    "message": "Signed in successfully",
    "data": {
        "user": {
            "id": "uuid",
            "email": "user@example.com",
            "role": "student"
        },
        "access_token": "eyJhbGciOiJIUzI1NiIs...",
        "session": {
            "expires_at": "2024-01-25T10:00:00Z"
        }
    }
}
```

---

### Get Current User

Get authenticated user information.

**Endpoint:** `GET /auth/me`

**Access:** Protected (Any authenticated user)

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "email": "user@example.com",
        "role": "student",
        "profile": {
            "phone": "+1234567890",
            "department": "Computer Science"
        }
    }
}
```

---

### Sign Out

Sign out current user.

**Endpoint:** `POST /auth/signout`

**Access:** Protected

**Response:** `200 OK`
```json
{
    "success": true,
    "message": "Signed out successfully"
}
```

---

### Refresh Session

Refresh access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Access:** Public

**Request Body:**
```json
{
    "refresh_token": "refresh_token_string"
}
```

**Response:** `200 OK`
```json
{
    "success": true,
    "message": "Session refreshed successfully",
    "data": {
        "access_token": "new_access_token",
        "expires_at": "2024-01-25T10:00:00Z"
    }
}
```

---

### Update Password

Update user password.

**Endpoint:** `POST /auth/update-password`

**Access:** Protected

**Request Body:**
```json
{
    "new_password": "NewSecurePassword123"
}
```

**Response:** `200 OK`
```json
{
    "success": true,
    "message": "Password updated successfully"
}
```

---

## Student Management Endpoints

### Create Student

Create a new student record.

**Endpoint:** `POST /students`

**Access:** Protected (Admin, Counselor)

**Request Body:**
```json
{
    "student_id": "STU001",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "department": "Computer Science",
    "year": 2,
    "gpa": 3.5,
    "attendance_rate": 0.92,
    "participation_score": 8,
    "credits_enrolled": 15,
    "financial_aid": "Yes",
    "parent_education_level": "Bachelor",
    "motivation_score": 7,
    "stress_level": 4
}
```

**Response:** `201 Created`
```json
{
    "success": true,
    "message": "Student created successfully",
    "data": {
        "id": "uuid",
        "student_id": "STU001",
        "name": "Jane Smith",
        ...
    }
}
```

---

### Get Student

Retrieve student by ID.

**Endpoint:** `GET /students/{student_id}`

**Access:** Protected

**Response:** `200 OK`
```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "student_id": "STU001",
        "name": "Jane Smith",
        "email": "jane@example.com",
        ...
    }
}
```

---

### Update Student

Update student information.

**Endpoint:** `PUT /students/{student_id}`

**Access:** Protected (Admin, Counselor)

**Request Body:**
```json
{
    "gpa": 3.7,
    "attendance_rate": 0.95
}
```

**Response:** `200 OK`
```json
{
    "success": true,
    "message": "Student updated successfully",
    "data": {
        "student_id": "STU001",
        "gpa": 3.7,
        ...
    }
}
```

---

### Delete Student

Delete a student record.

**Endpoint:** `DELETE /students/{student_id}`

**Access:** Protected (Admin only)

**Response:** `200 OK`
```json
{
    "success": true,
    "message": "Student deleted successfully"
}
```

---

### List Students

List students with pagination and filters.

**Endpoint:** `GET /students`

**Access:** Protected

**Query Parameters:**
- `page` (integer): Page number, default: 1
- `page_size` (integer): Items per page, default: 20
- `department` (string): Filter by department
- `year` (integer): Filter by year

**Example:** `GET /students?page=1&page_size=20&department=Computer Science`

**Response:** `200 OK`
```json
{
    "success": true,
    "data": [
        {
            "student_id": "STU001",
            "name": "Jane Smith",
            ...
        }
    ],
    "meta": {
        "page": 1,
        "page_size": 20,
        "total": 100,
        "total_pages": 5,
        "has_next": true,
        "has_prev": false
    }
}
```

---

### Get Student Academic Data

Get comprehensive academic data for a student.

**Endpoint:** `GET /students/{student_id}/academic-data`

**Access:** Protected

**Response:** `200 OK`
```json
{
    "success": true,
    "data": {
        "student": { ... },
        "academic_records": [ ... ],
        "attendance_records": [ ... ],
        "behavioral_records": [ ... ]
    }
}
```

---

### Bulk Import Students

Import multiple students at once.

**Endpoint:** `POST /students/bulk-import`

**Access:** Protected (Admin only)

**Request Body:**
```json
{
    "students": [
        {
            "student_id": "STU001",
            "name": "Jane Smith",
            ...
        },
        {
            "student_id": "STU002",
            "name": "John Doe",
            ...
        }
    ]
}
```

**Response:** `200 OK`
```json
{
    "success": true,
    "message": "Imported 2 students successfully",
    "data": {
        "imported": 2,
        "data": [ ... ]
    }
}
```

---

## Prediction Endpoints

### Predict Dropout Risk

Predict dropout risk for a single student.

**Endpoint:** `POST /predictions/predict/{student_id}`

**Access:** Protected (Admin, Counselor)

**Query Parameters:**
- `save` (boolean): Save prediction to database, default: true

**Response:** `200 OK`
```json
{
    "success": true,
    "message": "Prediction completed successfully",
    "data": {
        "student_id": "STU001",
        "dropout_prediction": false,
        "risk_score": 0.35,
        "risk_level": "Medium",
        "contributing_factors": [
            {
                "factor": "gpa",
                "value": 2.5,
                "importance": 0.23,
                "contribution": 0.12
            },
            {
                "factor": "attendance_rate",
                "value": 0.75,
                "importance": 0.18,
                "contribution": 0.09
            }
        ],
        "confidence": 0.87,
        "prediction_id": "uuid"
    }
}
```

---

### Batch Prediction

Predict dropout risk for multiple students.

**Endpoint:** `POST /predictions/predict/batch`

**Access:** Protected (Admin, Counselor)

**Request Body:**
```json
{
    "student_ids": ["STU001", "STU002", "STU003"],
    "save_predictions": true
}
```

**Response:** `200 OK`
```json
{
    "success": true,
    "message": "Batch prediction completed. 3/3 successful",
    "data": {
        "predictions": [
            {
                "student_id": "STU001",
                "risk_level": "Medium",
                ...
            }
        ],
        "summary": {
            "total": 3,
            "successful": 3,
            "failed": 0
        }
    }
}
```

---

### Get Prediction

Retrieve a prediction by ID.

**Endpoint:** `GET /predictions/{prediction_id}`

**Access:** Protected

**Response:** `200 OK`
```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "student_id": "STU001",
        "risk_level": "Medium",
        "risk_score": 0.35,
        ...
    }
}
```

---

### Get Student Predictions

Get prediction history for a student.

**Endpoint:** `GET /predictions/student/{student_id}`

**Access:** Protected

**Query Parameters:**
- `limit` (integer): Maximum predictions to return, default: 10

**Response:** `200 OK`
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid",
            "risk_level": "Medium",
            "created_at": "2024-01-24T10:00:00Z",
            ...
        }
    ]
}
```

---

### Get Latest Prediction

Get the most recent prediction for a student.

**Endpoint:** `GET /predictions/student/{student_id}/latest`

**Access:** Protected

**Response:** `200 OK`
```json
{
    "success": true,
    "data": {
        "id": "uuid",
        "student_id": "STU001",
        "risk_level": "Medium",
        "created_at": "2024-01-24T10:00:00Z",
        ...
    }
}
```

---

### List Predictions

List all predictions with pagination and filters.

**Endpoint:** `GET /predictions`

**Access:** Protected

**Query Parameters:**
- `page` (integer): Page number
- `page_size` (integer): Items per page
- `risk_level` (string): Filter by risk level (Low/Medium/High)

**Response:** `200 OK` (Paginated)

---

### Get High Risk Students

Get students with high dropout risk.

**Endpoint:** `GET /predictions/high-risk`

**Access:** Protected (Admin, Counselor)

**Query Parameters:**
- `limit` (integer): Maximum students to return, default: 50

**Response:** `200 OK`
```json
{
    "success": true,
    "message": "Found 15 high-risk students",
    "data": [
        {
            "id": "uuid",
            "student_id": "STU001",
            "risk_score": 0.85,
            "students": {
                "name": "Jane Smith",
                "email": "jane@example.com"
            }
        }
    ]
}
```

---

### Get Prediction Statistics

Get overall prediction statistics.

**Endpoint:** `GET /predictions/statistics`

**Access:** Protected (Admin, Counselor)

**Response:** `200 OK`
```json
{
    "success": true,
    "data": {
        "total_predictions": 100,
        "low_risk": 60,
        "medium_risk": 25,
        "high_risk": 15,
        "low_percentage": 60.0,
        "medium_percentage": 25.0,
        "high_percentage": 15.0
    }
}
```

---

## Counseling Endpoints

### Create Counseling Session

Create a new counseling session.

**Endpoint:** `POST /counseling/sessions`

**Access:** Protected (Counselor, Admin)

**Request Body:**
```json
{
    "student_id": "STU001",
    "session_type": "academic",
    "session_date": "2024-01-24T14:00:00Z",
    "notes": "Discussed study strategies and time management",
    "requires_followup": true,
    "followup_date": "2024-02-01"
}
```

**Response:** `201 Created`
```json
{
    "success": true,
    "message": "Counseling session created successfully",
    "data": {
        "id": "uuid",
        "student_id": "STU001",
        "counselor_id": "uuid",
        ...
    }
}
```

---

### Get Counseling Session

Retrieve a counseling session by ID.

**Endpoint:** `GET /counseling/sessions/{session_id}`

**Access:** Protected

**Response:** `200 OK`

---

### Update Counseling Session

Update a counseling session.

**Endpoint:** `PUT /counseling/sessions/{session_id}`

**Access:** Protected (Counselor, Admin)

**Request Body:**
```json
{
    "notes": "Updated notes",
    "requires_followup": false
}
```

**Response:** `200 OK`

---

### Get Student Sessions

Get counseling sessions for a student.

**Endpoint:** `GET /counseling/sessions/student/{student_id}`

**Access:** Protected

**Query Parameters:**
- `limit` (integer): Maximum sessions, default: 20

**Response:** `200 OK`

---

### List Counseling Sessions

List all counseling sessions with pagination.

**Endpoint:** `GET /counseling/sessions`

**Access:** Protected

**Query Parameters:**
- `page`, `page_size`: Pagination
- `counselor_id`: Filter by counselor
- `student_id`: Filter by student
- `session_type`: Filter by type

**Response:** `200 OK` (Paginated)

---

### Create Recommendation

Create a counseling recommendation.

**Endpoint:** `POST /counseling/recommendations`

**Access:** Protected (Counselor, Admin)

**Request Body:**
```json
{
    "student_id": "STU001",
    "recommendation_type": "academic_support",
    "description": "Recommend tutoring for mathematics",
    "status": "pending"
}
```

**Response:** `201 Created`

---

### Get Student Recommendations

Get recommendations for a student.

**Endpoint:** `GET /counseling/recommendations/student/{student_id}`

**Access:** Protected

**Query Parameters:**
- `status` (string): Filter by status (pending/in_progress/completed)

**Response:** `200 OK`

---

### Update Recommendation

Update a recommendation.

**Endpoint:** `PUT /counseling/recommendations/{recommendation_id}`

**Access:** Protected (Counselor, Admin)

**Request Body:**
```json
{
    "status": "completed",
    "notes": "Tutoring sessions completed"
}
```

**Response:** `200 OK`

---

### Get Pending Follow-ups

Get sessions requiring follow-up.

**Endpoint:** `GET /counseling/followups`

**Access:** Protected (Counselor, Admin)

**Query Parameters:**
- `counselor_id` (string): Filter by counselor

**Response:** `200 OK`

---

## ML Model Management Endpoints

### Train Model

Train a new ML model.

**Endpoint:** `POST /models/train`

**Access:** Protected (Admin only)

**Request Body:**
```json
{
    "training_data": [
        {
            "student_id": "STU001",
            "gpa": 3.5,
            "attendance_rate": 0.92,
            "dropout": "No"
        }
    ],
    "model_type": "random_forest",
    "save_model": true
}
```

**Response:** `200 OK`
```json
{
    "success": true,
    "message": "Model trained successfully. Accuracy: 0.8750",
    "data": {
        "model_type": "random_forest",
        "metrics": {
            "accuracy": 0.875,
            "precision": 0.85,
            "recall": 0.82,
            "f1_score": 0.835,
            "roc_auc": 0.91
        },
        "model_path": "app/ml/models/random_forest_model.pkl"
    }
}
```

---

### Get Model Info

Get information about the current model.

**Endpoint:** `GET /models/info`

**Access:** Protected (Admin, Counselor)

**Response:** `200 OK`
```json
{
    "success": true,
    "data": {
        "status": "trained",
        "metadata": {
            "model_type": "random_forest",
            "trained_at": "2024-01-24T10:00:00Z",
            "training_samples": 1000,
            "feature_count": 14,
            "features": ["gpa", "attendance_rate", ...],
            "metrics": { ... }
        },
        "feature_importances": {
            "gpa": 0.23,
            "attendance_rate": 0.18,
            ...
        }
    }
}
```

---

### Evaluate Model

Evaluate model performance on test data.

**Endpoint:** `POST /models/evaluate`

**Access:** Protected (Admin only)

**Request Body:**
```json
{
    "test_data": [...]
}
```

**Response:** `200 OK`

---

### Get Feature Importance

Get feature importance from the current model.

**Endpoint:** `GET /models/feature-importance`

**Access:** Protected (Admin, Counselor)

**Response:** `200 OK`
```json
{
    "success": true,
    "data": {
        "feature_importance": {
            "gpa": 0.23,
            "attendance_rate": 0.18,
            "participation_score": 0.15,
            ...
        },
        "top_features": [
            ["gpa", 0.23],
            ["attendance_rate", 0.18],
            ...
        ]
    }
}
```

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Default**: 100 requests per hour per IP address
- **Configurable** via environment variables

When rate limit is exceeded:
```json
{
    "error": "Rate limit exceeded",
    "retry_after": 3600
}
```

---

## Error Codes Reference

| Error Code | Description | Resolution |
|------------|-------------|------------|
| AUTH001 | Invalid credentials | Check email/password |
| AUTH002 | Token expired | Refresh session |
| AUTH003 | Insufficient permissions | Check user role |
| VAL001 | Missing required field | Provide all required fields |
| VAL002 | Invalid format | Check data format |
| NOT001 | Resource not found | Verify ID exists |
| MOD001 | Model not trained | Train model first |
| MOD002 | Prediction failed | Check input data |

---

## Interactive API Documentation

Visit `/api/docs/` when the server is running for interactive Swagger documentation where you can test endpoints directly.
