# Data Flow Diagram

## Level 0: Context Diagram

```
┌─────────────┐
│   Students  │
└──────┬──────┘
       │
       │ View predictions
       │ Update profile
       │
┌──────▼────────────────────────────────────┐
│                                           │
│   AI Dropout Prediction &                │
│   Counseling System                       │
│                                           │
└──────┬────────────────────┬───────────────┘
       │                    │
       │ Manage students    │ Access data
       │ Create sessions    │ Manage models
       │                    │
┌──────▼──────┐      ┌──────▼──────┐
│ Counselors  │      │   Admins    │
└─────────────┘      └─────────────┘
```

## Level 1: System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                      Users (All Roles)                       │
└────────────┬─────────────────────────────────┬───────────────┘
             │                                 │
             │ Authentication                  │ API Requests
             │                                 │
┌────────────▼──────────┐          ┌──────────▼───────────────┐
│   Authentication      │          │   API Gateway            │
│   Service             │          │   (Flask Routes)         │
└────────────┬──────────┘          └──────────┬───────────────┘
             │                                 │
             │ User tokens                     │ Service calls
             │                                 │
┌────────────▼─────────────────────────────────▼───────────────┐
│                    Business Logic Layer                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Student  │  │Prediction│  │Counseling│  │    ML    │   │
│  │ Service  │  │ Service  │  │ Service  │  │ Service  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        │ DB ops      │ DB ops      │ DB ops      │ Model ops
        │             │             │             │
┌───────▼─────────────▼─────────────▼─────────────▼──────────┐
│                    Data Layer                               │
│  ┌────────────────────────┐    ┌──────────────────────┐   │
│  │   Supabase Database    │    │   ML Model Storage   │   │
│  │   (PostgreSQL)         │    │   (File System)      │   │
│  └────────────────────────┘    └──────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

## Level 2: Detailed Data Flows

### Authentication Flow

```
┌──────┐                                                   ┌──────────┐
│Client│                                                   │ Supabase │
└───┬──┘                                                   └────┬─────┘
    │                                                           │
    │ 1. POST /auth/signup                                     │
    │ {email, password, role}                                  │
    ├──────────────────────────────►┐                         │
    │                               │                         │
    │                          ┌────▼────┐                    │
    │                          │  Flask  │                    │
    │                          │   API   │                    │
    │                          └────┬────┘                    │
    │                               │                         │
    │                               │ 2. Validate input       │
    │                               │                         │
    │                               │ 3. Create user          │
    │                               ├────────────────────────►│
    │                               │                         │
    │                               │ 4. User created         │
    │                               │◄────────────────────────┤
    │                               │    + JWT token          │
    │ 5. Success response           │                         │
    │◄──────────────────────────────┤                         │
    │    {user, token}              │                         │
    │                               │                         │
    │ 6. Subsequent requests        │                         │
    │    Authorization: Bearer token│                         │
    ├──────────────────────────────►│                         │
    │                               │                         │
    │                               │ 7. Verify token         │
    │                               ├────────────────────────►│
    │                               │                         │
    │                               │ 8. User info            │
    │                               │◄────────────────────────┤
    │                               │                         │
    │ 9. Protected resource         │                         │
    │◄──────────────────────────────┤                         │
    │                                                           
```

### Student Data Management Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│Counselor/│      │  Flask   │      │ Student  │      │ Supabase │
│  Admin   │      │   API    │      │ Service  │      │    DB    │
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                  │                  │
     │ 1. Create       │                  │                  │
     │    Student      │                  │                  │
     ├────────────────►│                  │                  │
     │                 │                  │                  │
     │                 │ 2. Validate      │                  │
     │                 │    & authorize   │                  │
     │                 │                  │                  │
     │                 │ 3. Create student│                  │
     │                 ├─────────────────►│                  │
     │                 │                  │                  │
     │                 │                  │ 4. INSERT query  │
     │                 │                  ├─────────────────►│
     │                 │                  │                  │
     │                 │                  │ 5. Student record│
     │                 │                  │◄─────────────────┤
     │                 │                  │                  │
     │                 │ 6. Student data  │                  │
     │                 │◄─────────────────┤                  │
     │                 │                  │                  │
     │ 7. Success      │                  │                  │
     │◄────────────────┤                  │                  │
     │                                                        
```

### Dropout Prediction Flow

```
┌──────────┐  ┌──────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌──────┐
│Counselor/│  │Flask │  │  ML    │  │Dropout │  │Student │  │Supabase│
│  Admin   │  │ API  │  │Service │  │ Model  │  │Service │  │   DB   │
└────┬─────┘  └───┬──┘  └───┬────┘  └───┬────┘  └───┬────┘  └───┬────┘
     │            │         │           │           │           │
     │ 1. Predict │         │           │           │           │
     │    dropout │         │           │           │           │
     ├───────────►│         │           │           │           │
     │            │         │           │           │           │
     │            │ 2. Init │           │           │           │
     │            │  predict│           │           │           │
     │            ├────────►│           │           │           │
     │            │         │           │           │           │
     │            │         │ 3. Fetch  │           │           │
     │            │         │   student │           │           │
     │            │         │   data    │           │           │
     │            │         ├───────────────────────►│           │
     │            │         │           │           │           │
     │            │         │           │           │ 4. Query  │
     │            │         │           │           ├──────────►│
     │            │         │           │           │           │
     │            │         │           │           │ 5. Data   │
     │            │         │           │           │◄──────────┤
     │            │         │           │           │           │
     │            │         │ 6. Student│           │           │
     │            │         │    data   │           │           │
     │            │         │◄───────────────────────┤           │
     │            │         │           │           │           │
     │            │         │ 7. Preprocess          │           │
     │            │         │    & extract           │           │
     │            │         │    features            │           │
     │            │         │           │           │           │
     │            │         │ 8. Predict│           │           │
     │            │         ├──────────►│           │           │
     │            │         │           │           │           │
     │            │         │           │ 9. Calculate         │
     │            │         │           │    risk score        │
     │            │         │           │    & factors         │
     │            │         │           │           │           │
     │            │         │ 10. Results           │           │
     │            │         │◄──────────┤           │           │
     │            │         │           │           │           │
     │            │         │ 11. Save  │           │           │
     │            │         │   prediction          │           │
     │            │         ├──────────────────────────────────►│
     │            │         │           │           │           │
     │            │ 12. Return         │           │           │
     │            │   prediction       │           │           │
     │            │◄────────┤           │           │           │
     │            │         │           │           │           │
     │ 13. Results│         │           │           │           │
     │◄───────────┤         │           │           │           │
     │                                                           
```

### Counseling Session Flow

```
┌──────────┐      ┌──────────┐      ┌──────────┐      ┌──────────┐
│Counselor │      │  Flask   │      │Counseling│      │ Supabase │
│          │      │   API    │      │ Service  │      │    DB    │
└────┬─────┘      └────┬─────┘      └────┬─────┘      └────┬─────┘
     │                 │                  │                  │
     │ 1. Create       │                  │                  │
     │    session      │                  │                  │
     ├────────────────►│                  │                  │
     │                 │                  │                  │
     │                 │ 2. Validate      │                  │
     │                 │    & authorize   │                  │
     │                 │                  │                  │
     │                 │ 3. Create session│                  │
     │                 ├─────────────────►│                  │
     │                 │                  │                  │
     │                 │                  │ 4. Insert session│
     │                 │                  ├─────────────────►│
     │                 │                  │                  │
     │                 │                  │ 5. Session record│
     │                 │                  │◄─────────────────┤
     │                 │                  │                  │
     │                 │ 6. Session data  │                  │
     │                 │◄─────────────────┤                  │
     │                 │                  │                  │
     │ 7. Success      │                  │                  │
     │◄────────────────┤                  │                  │
     │                 │                  │                  │
     │ 8. Create       │                  │                  │
     │    recommendation                 │                  │
     ├────────────────►│                  │                  │
     │                 │                  │                  │
     │                 │ 9. Create recom. │                  │
     │                 ├─────────────────►│                  │
     │                 │                  │                  │
     │                 │                  │ 10. Insert recom.│
     │                 │                  ├─────────────────►│
     │                 │                  │                  │
     │                 │                  │ 11. Recom. record│
     │                 │                  │◄─────────────────┤
     │                 │                  │                  │
     │                 │ 12. Recom. data  │                  │
     │                 │◄─────────────────┤                  │
     │                 │                  │                  │
     │ 13. Success     │                  │                  │
     │◄────────────────┤                  │                  │
     │                                                        
```

### Model Training Flow

```
┌──────┐      ┌──────┐      ┌────────┐      ┌────────┐      ┌──────┐
│Admin │      │Flask │      │   ML   │      │Dropout │      │ File │
│      │      │ API  │      │Service │      │ Model  │      │System│
└───┬──┘      └───┬──┘      └───┬────┘      └───┬────┘      └───┬──┘
    │             │              │               │               │
    │ 1. Train    │              │               │               │
    │    model    │              │               │               │
    │    +data    │              │               │               │
    ├────────────►│              │               │               │
    │             │              │               │               │
    │             │ 2. Validate  │               │               │
    │             │    admin role│               │               │
    │             │              │               │               │
    │             │ 3. Train     │               │               │
    │             ├─────────────►│               │               │
    │             │              │               │               │
    │             │              │ 4. Preprocess │               │
    │             │              │    data       │               │
    │             │              │               │               │
    │             │              │ 5. Train model│               │
    │             │              ├──────────────►│               │
    │             │              │               │               │
    │             │              │               │ 6. Fit on data│
    │             │              │               │    Calculate  │
    │             │              │               │    metrics    │
    │             │              │               │               │
    │             │              │ 7. Metrics    │               │
    │             │              │◄──────────────┤               │
    │             │              │               │               │
    │             │              │ 8. Save model │               │
    │             │              ├──────────────────────────────►│
    │             │              │               │               │
    │             │              │               │ 9. Model saved│
    │             │              │◄──────────────────────────────┤
    │             │              │               │               │
    │             │ 10. Training │               │               │
    │             │    results   │               │               │
    │             │◄─────────────┤               │               │
    │             │              │               │               │
    │ 11. Success │              │               │               │
    │    +metrics │              │               │               │
    │◄────────────┤              │               │               │
    │                                                             
```

## Data Flow Summary

### Key Data Flows:

1. **Authentication**: User → Flask API → Supabase Auth → JWT Token
2. **Student Management**: Counselor → API → Service → Database
3. **Prediction**: Request → ML Service → Model → Database → Response
4. **Counseling**: Counselor → API → Service → Database
5. **Model Training**: Admin → API → ML Service → Model → File System

### Data Storage:

- **User Data**: Stored in Supabase Auth
- **Student Records**: Stored in Supabase PostgreSQL
- **Predictions**: Stored in Supabase PostgreSQL
- **Counseling Data**: Stored in Supabase PostgreSQL
- **ML Models**: Stored in local file system (pkl/joblib)

### Data Access Patterns:

- **Read-Heavy**: Student data, predictions (indexed)
- **Write-Heavy**: Logs, session tracking
- **Batch Operations**: Bulk predictions, model training
- **Real-Time**: Authentication, authorization checks
