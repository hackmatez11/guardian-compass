# AI-Based Dropout Prediction and Counseling System - Backend API

A comprehensive Flask-based RESTful API backend for predicting student dropout risk using machine learning and providing counseling management features.

## 🎯 Overview

This backend system provides:
- **Machine Learning-based Dropout Prediction** using Random Forest and Logistic Regression
- **Supabase Integration** for authentication, database, and role-based access control
- **RESTful APIs** for student management, predictions, and counseling
- **Secure Authentication** with JWT tokens via Supabase
- **Role-Based Access Control** (Student, Counselor, Admin)
- **Comprehensive Logging** and error handling
- **API Documentation** with Swagger/Flasgger

## 🏗️ Architecture

```
backend/
├── app/
│   ├── api/
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth_routes.py
│   │   │   ├── student_routes.py
│   │   │   ├── prediction_routes.py
│   │   │   ├── counseling_routes.py
│   │   │   └── model_routes.py
│   │   └── schemas/         # Data validation schemas
│   ├── ml/
│   │   ├── model.py         # ML model implementation
│   │   └── models/          # Trained model storage
│   ├── services/
│   │   ├── auth_service.py  # Authentication logic
│   │   ├── student_service.py
│   │   ├── prediction_service.py
│   │   ├── counseling_service.py
│   │   └── ml_service.py    # ML operations
│   ├── utils/
│   │   ├── logger.py        # Logging configuration
│   │   ├── exceptions.py    # Custom exceptions
│   │   ├── response.py      # Response helpers
│   │   └── validators.py    # Data validation
│   └── __init__.py          # Flask app factory
├── config/
│   ├── config.py            # Configuration management
│   └── supabase.py          # Supabase client setup
├── logs/                    # Application logs
├── tests/                   # Unit and integration tests
├── docs/                    # Additional documentation
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
└── run.py                  # Application entry point
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Supabase account and project
- PostgreSQL database (provided by Supabase)

### Installation

1. **Clone the repository**
```bash
cd /home/user/webapp/backend
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your Supabase credentials and configuration
```

5. **Run the application**
```bash
python run.py
```

The API will be available at `http://localhost:5000`

API Documentation: `http://localhost:5000/api/docs/`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Flask Configuration
FLASK_APP=run.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DEBUG=True

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# API Configuration
API_VERSION=v1
API_PREFIX=/api/v1
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_ENABLED=True
RATE_LIMIT_DEFAULT=100 per hour

# ML Model Configuration
MODEL_PATH=app/ml/models
MODEL_RETRAIN_THRESHOLD=0.75

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/app.log
```

### Supabase Setup

1. **Create Supabase Project**: Sign up at [supabase.com](https://supabase.com)

2. **Database Schema**: Run these SQL commands in Supabase SQL Editor:

```sql
-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE counseling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE counseling_recommendations ENABLE ROW LEVEL SECURITY;

-- Create Students Table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100),
    year INTEGER,
    gpa DECIMAL(3, 2),
    attendance_rate DECIMAL(5, 2),
    participation_score INTEGER,
    credits_enrolled INTEGER,
    financial_aid VARCHAR(10),
    parent_education_level VARCHAR(50),
    motivation_score INTEGER,
    stress_level INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Academic Records Table
CREATE TABLE academic_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) REFERENCES students(student_id),
    semester VARCHAR(20),
    gpa DECIMAL(3, 2),
    grade VARCHAR(2),
    assignments_completed INTEGER,
    total_assignments INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Attendance Records Table
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) REFERENCES students(student_id),
    date DATE,
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Behavioral Records Table
CREATE TABLE behavioral_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) REFERENCES students(student_id),
    date DATE,
    incident_type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Predictions Table
CREATE TABLE predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) REFERENCES students(student_id),
    risk_level VARCHAR(20) NOT NULL,
    risk_score DECIMAL(5, 4),
    contributing_factors JSONB,
    model_type VARCHAR(50),
    confidence DECIMAL(5, 4),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create Counseling Sessions Table
CREATE TABLE counseling_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) REFERENCES students(student_id),
    counselor_id UUID REFERENCES auth.users(id),
    session_type VARCHAR(50),
    session_date TIMESTAMP,
    notes TEXT,
    requires_followup BOOLEAN DEFAULT FALSE,
    followup_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create Counseling Recommendations Table
CREATE TABLE counseling_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(50) REFERENCES students(student_id),
    counselor_id UUID REFERENCES auth.users(id),
    recommendation_type VARCHAR(50),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_predictions_student_id ON predictions(student_id);
CREATE INDEX idx_predictions_risk_level ON predictions(risk_level);
CREATE INDEX idx_counseling_sessions_student_id ON counseling_sessions(student_id);
CREATE INDEX idx_counseling_sessions_counselor_id ON counseling_sessions(counselor_id);
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "role": "student",
  "name": "John Doe"
}
```

#### Sign In
```http
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

### Student Management Endpoints

#### Create Student
```http
POST /api/v1/students
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "student_id": "STU001",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "department": "Computer Science",
  "year": 2,
  "gpa": 3.5
}
```

#### Get Student
```http
GET /api/v1/students/<student_id>
Authorization: Bearer <access_token>
```

#### List Students
```http
GET /api/v1/students?page=1&page_size=20
Authorization: Bearer <access_token>
```

### Prediction Endpoints

#### Predict Dropout Risk
```http
POST /api/v1/predictions/predict/<student_id>
Authorization: Bearer <access_token>
```

#### Batch Prediction
```http
POST /api/v1/predictions/predict/batch
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "student_ids": ["STU001", "STU002", "STU003"],
  "save_predictions": true
}
```

#### Get High Risk Students
```http
GET /api/v1/predictions/high-risk?limit=50
Authorization: Bearer <access_token>
```

#### Get Prediction Statistics
```http
GET /api/v1/predictions/statistics
Authorization: Bearer <access_token>
```

### Counseling Endpoints

#### Create Counseling Session
```http
POST /api/v1/counseling/sessions
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "student_id": "STU001",
  "session_type": "academic",
  "session_date": "2024-01-15T10:00:00Z",
  "notes": "Discussed study strategies"
}
```

#### Create Recommendation
```http
POST /api/v1/counseling/recommendations
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "student_id": "STU001",
  "recommendation_type": "academic_support",
  "description": "Recommend tutoring for mathematics"
}
```

### ML Model Management Endpoints

#### Train Model
```http
POST /api/v1/models/train
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "training_data": [...],
  "model_type": "random_forest",
  "save_model": true
}
```

#### Get Model Info
```http
GET /api/v1/models/info
Authorization: Bearer <access_token>
```

#### Get Feature Importance
```http
GET /api/v1/models/feature-importance
Authorization: Bearer <access_token>
```

For complete API documentation, visit `/api/docs/` when the server is running.

## 🔐 Security Features

- **JWT Authentication** via Supabase
- **Role-Based Access Control** (RBAC)
- **Rate Limiting** to prevent abuse
- **Input Validation** on all endpoints
- **SQL Injection Prevention** via Supabase client
- **CORS Configuration** for cross-origin requests
- **Encrypted Data Transfer** (HTTPS recommended in production)

## 🤖 Machine Learning Features

### Supported Models
- **Random Forest Classifier** (default)
- **Logistic Regression**

### Features Used for Prediction
- GPA (current and previous)
- Attendance rate
- Participation score
- Assignment completion rate
- Disciplinary incidents
- Financial aid status
- Parent education level
- Credits enrolled
- Failed courses count
- Motivation score
- Stress level

### Risk Levels
- **Low Risk**: Probability < 0.33
- **Medium Risk**: 0.33 ≤ Probability < 0.67
- **High Risk**: Probability ≥ 0.67

### Model Training
The system includes:
- **SMOTE** for handling class imbalance
- **Cross-validation** for robust evaluation
- **Feature scaling** with StandardScaler
- **Feature importance** analysis
- **Model persistence** for reuse

## 📊 Data Flow

```
1. Student Data Collection
   ↓
2. Data Preprocessing & Feature Engineering
   ↓
3. ML Model Prediction
   ↓
4. Risk Assessment (Low/Medium/High)
   ↓
5. Contributing Factors Analysis
   ↓
6. Store Prediction Results
   ↓
7. Counseling Recommendations
   ↓
8. Follow-up Tracking
```

## 🧪 Testing

Run tests (once implemented):
```bash
pytest tests/ -v --cov=app
```

## 📝 Logging

Logs are stored in `logs/app.log` with JSON format for easy parsing.

Log levels:
- **DEBUG**: Detailed diagnostic information
- **INFO**: General informational messages
- **WARNING**: Warning messages
- **ERROR**: Error messages
- **CRITICAL**: Critical errors

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Use production values
2. **HTTPS**: Enable SSL/TLS
3. **Database**: Use production Supabase instance
4. **Rate Limiting**: Adjust limits for production traffic
5. **Logging**: Configure centralized logging
6. **Monitoring**: Implement application monitoring
7. **Scaling**: Use WSGI server (Gunicorn, uWSGI)

### Docker Deployment

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]
```

### Gunicorn Production Server

```bash
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 run:app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 👥 Support

For issues and questions:
- GitHub Issues: [Project Issues](https://github.com/your-repo/issues)
- Email: support@example.com

## 🔄 Version History

- **v1.0.0** (2024-01-24): Initial release
  - Complete REST API implementation
  - ML-based dropout prediction
  - Supabase integration
  - Role-based access control
  - Comprehensive documentation
