# AI-Based Dropout Prediction and Counseling System

A comprehensive full-stack application for predicting student dropout risk using machine learning and managing counseling interventions.

## 🎯 Project Overview

This system combines a React frontend with a Flask backend to provide:
- **AI-powered dropout prediction** using machine learning models
- **Student data management** with comprehensive academic tracking
- **Counseling session management** and intervention tracking
- **Role-based access control** for students, counselors, and administrators
- **Real-time analytics and reporting**

## 📁 Project Structure

```
.
├── backend/              # Flask API Backend
│   ├── app/             # Application code
│   ├── config/          # Configuration
│   ├── docs/            # Backend documentation
│   ├── logs/            # Application logs
│   └── tests/           # Unit tests
│
├── src/                 # React Frontend
├── public/              # Static assets
└── supabase/           # Database migrations
```

## 🚀 Quick Start

### Frontend Setup

**Requirements:**
- Node.js 16+ and npm

**Installation:**
```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

**Requirements:**
- Python 3.8+
- Supabase account

**Installation:**
```sh
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Run the backend server
python run.py
```

The backend API will be available at `http://localhost:5000`

API Documentation: `http://localhost:5000/api/docs/`

## 🔧 Configuration

### Frontend Environment Variables

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend Environment Variables

See `backend/.env.example` for all available configuration options.

Key variables:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Supabase anon key
- `SUPABASE_SERVICE_KEY`: Supabase service role key (for admin operations)
- `SECRET_KEY`: Flask secret key for sessions

## 📚 Documentation

### Backend Documentation
- [Project Overview](./backend/docs/PROJECT_OVERVIEW.md) - System architecture and features
- [API Reference](./backend/docs/API_REFERENCE.md) - Complete API documentation
- [Data Flow Diagram](./backend/docs/DATA_FLOW_DIAGRAM.md) - System data flows
- [Class Diagram](./backend/docs/CLASS_DIAGRAM.md) - Code architecture
- [Backend README](./backend/README.md) - Detailed backend documentation

### Key Features Documentation

**Authentication & Authorization:**
- JWT-based authentication via Supabase
- Role-based access control (Student, Counselor, Admin)
- Secure password management

**ML Prediction System:**
- Random Forest and Logistic Regression models
- 14+ features for dropout prediction
- Risk categorization (Low/Medium/High)
- Contributing factors analysis

**Student Management:**
- CRUD operations for student records
- Academic performance tracking
- Attendance monitoring
- Bulk import functionality

**Counseling Management:**
- Session scheduling and notes
- Recommendation tracking
- Follow-up management

## 🛠️ Technologies Used

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **UI Library:** shadcn/ui
- **Styling:** Tailwind CSS
- **State Management:** React Query
- **Routing:** React Router
- **Backend Integration:** Supabase client

### Backend
- **Framework:** Flask 3.0
- **Database:** PostgreSQL (via Supabase)
- **Authentication:** Supabase Auth
- **ML Libraries:** scikit-learn, pandas, numpy
- **API Documentation:** Flasgger (Swagger)
- **Testing:** pytest
- **Logging:** python-json-logger

## 📊 API Endpoints Overview

```
Authentication:
  POST   /api/v1/auth/signup
  POST   /api/v1/auth/signin
  GET    /api/v1/auth/me
  POST   /api/v1/auth/signout

Students:
  POST   /api/v1/students
  GET    /api/v1/students/{id}
  PUT    /api/v1/students/{id}
  DELETE /api/v1/students/{id}
  GET    /api/v1/students

Predictions:
  POST   /api/v1/predictions/predict/{student_id}
  POST   /api/v1/predictions/predict/batch
  GET    /api/v1/predictions/{id}
  GET    /api/v1/predictions/high-risk
  GET    /api/v1/predictions/statistics

Counseling:
  POST   /api/v1/counseling/sessions
  GET    /api/v1/counseling/sessions/{id}
  PUT    /api/v1/counseling/sessions/{id}
  POST   /api/v1/counseling/recommendations
  GET    /api/v1/counseling/followups

ML Models:
  POST   /api/v1/models/train
  GET    /api/v1/models/info
  GET    /api/v1/models/feature-importance
```

For complete API documentation with request/response examples, visit the [API Reference](./backend/docs/API_REFERENCE.md) or `/api/docs/` when running the backend.

## 🧪 Testing

### Frontend Tests
```sh
npm test
```

### Backend Tests
```sh
cd backend
pytest tests/ -v --cov=app
```

## 🚢 Deployment

### Frontend Deployment
Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

Alternatively, build and deploy to any static hosting:
```sh
npm run build
# Deploy the dist/ directory
```

### Backend Deployment

**Using Gunicorn (Production):**
```sh
cd backend
gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 run:app
```

**Using Docker:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]
```

## 🔐 Security Considerations

- All API endpoints use HTTPS in production
- JWT tokens with expiration
- Rate limiting enabled
- Input validation on all endpoints
- SQL injection prevention via Supabase
- CORS configuration for allowed origins
- Password strength requirements
- Role-based access control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - See LICENSE file for details

## 👥 Support

For issues and questions:
- GitHub Issues: [Project Issues](https://github.com/your-repo/issues)
- Email: support@example.com

## 🔄 Version History

- **v1.0.0** (2024-01-24): Initial release
  - Full-stack application with React frontend
  - Flask backend with ML prediction
  - Supabase integration
  - Complete CRUD operations
  - Role-based access control
  - Comprehensive documentation
