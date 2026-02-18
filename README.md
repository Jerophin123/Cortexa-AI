# AI-Powered Cognitive Risk Assessment System

A production-ready, full-stack AI-based Early-Stage Dementia Risk Stratification application built with a modern microservices architecture. This system provides comprehensive cognitive assessment capabilities with machine learning-powered risk prediction, user authentication, and assessment history tracking.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [System Requirements](#system-requirements)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Configuration](#configuration)
- [Deployment](#deployment)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Development](#development)
- [Medical Disclaimer](#medical-disclaimer)

---

## 🎯 Overview

The AI-Powered Dementia Risk Assessment System is a comprehensive healthcare application designed to assess early-stage dementia risk through cognitive testing and machine learning analysis. The system collects multi-modal cognitive data including speech patterns, memory performance, reaction times, and lifestyle factors to provide risk stratification.

### Key Features

- **Multi-Step Cognitive Assessment**: Speech analysis, memory recall, reaction time, task performance, and lifestyle evaluation
- **Machine Learning Risk Prediction**: Real-time risk stratification using trained ML models
- **User Authentication & Authorization**: Secure email-based registration with verification
- **Assessment History Tracking**: Complete audit trail of all assessments
- **Email Notifications**: Automated email delivery of assessment results
- **RESTful API**: Production-grade API with comprehensive validation
- **Microservices Architecture**: Scalable, containerized services
- **Health Monitoring**: Built-in health checks for all services

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (React/TypeScript)          │  │
│  │  Port: 3000 | Components: Forms, Tests, History, Auth   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/REST
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      API Gateway Layer                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Spring Boot Backend (Java 17)                    │  │
│  │  Port: 8080 | REST API | Validation | Business Logic     │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Controllers: Assessment, Auth                     │  │  │
│  │  │  Services: Assessment, Auth, Email, ML Client      │  │  │
│  │  │  Repositories: Assessment, User                    │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────┬──────────────────────────────┬────────────────────┘
             │                               │
             │ HTTP/REST                     │ HTTP/REST
             │                               │
┌────────────▼────────────┐    ┌────────────▼────────────┐
│   ML Service            │    │   Database Layer        │
│   (Python FastAPI)      │    │   SQLite                │
│   Port: 8000            │    │   File: assessments.db  │
│   ┌──────────────────┐  │    │   Tables:              │
│   │  Model Inference  │  │    │   - users              │
│   │  Preprocessing   │  │    │   - assessments        │
│   │  Risk Prediction  │  │    │   - id_generator      │
│   └──────────────────┘  │    └────────────────────────┘
└─────────────────────────┘
             │
             │ SMTP
             │
┌────────────▼────────────┐
│   Email Service         │
│   (Gmail SMTP)          │
│   - Verification        │
│   - Results Delivery    │
└─────────────────────────┘
```

### Component Interaction Flow

```
User Request Flow:
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Submit Assessment
     ▼
┌─────────────────┐
│  Frontend       │ ──► Validates UI inputs
│  (Next.js)      │
└────┬────────────┘
     │
     │ 2. POST /api/assessment
     ▼
┌─────────────────┐
│  Backend        │ ──► Validates request
│  (Spring Boot)  │ ──► Checks authentication
└────┬────────────┘
     │
     │ 3. POST /predict
     ▼
┌─────────────────┐
│  ML Service     │ ──► Preprocesses features
│  (FastAPI)      │ ──► Runs model inference
└────┬────────────┘ ──► Returns risk level
     │
     │ 4. Risk Prediction
     ▼
┌─────────────────┐
│  Backend        │ ──► Stores assessment
│  (Spring Boot)  │ ──► Generates recommendation
└────┬────────────┘ ──► Sends email notification
     │
     │ 5. Response
     ▼
┌─────────────────┐
│  Frontend       │ ──► Displays results
│  (Next.js)      │
└─────────────────┘
```

### Microservices Communication

- **Frontend ↔ Backend**: REST API over HTTP (CORS-enabled)
- **Backend ↔ ML Service**: REST API over HTTP (internal network)
- **Backend ↔ Database**: JDBC/SQLite (file-based)
- **Backend ↔ Email**: SMTP/TLS (Gmail)

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0+ | React framework with SSR capabilities |
| **React** | 19.0+ | UI library for component-based architecture |
| **TypeScript** | 5.0+ | Type-safe JavaScript for better code quality |
| **Axios** | 1.6+ | HTTP client for API communication |
| **CSS Modules** | - | Scoped styling for components |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Spring Boot** | 3.2.0 | Java framework for RESTful services |
| **Java** | 17+ | Programming language |
| **Spring Data JPA** | 3.2.0 | Database abstraction layer |
| **Hibernate** | 6.2+ | ORM framework |
| **SQLite JDBC** | 3.44.1.0 | Database driver |
| **Spring Validation** | 3.2.0 | Request validation framework |
| **Spring Mail** | 3.2.0 | Email service integration |
| **Maven** | 3.9+ | Build and dependency management |

### ML Service

| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.104.1 | High-performance Python web framework |
| **Uvicorn** | 0.24.0 | ASGI server for FastAPI |
| **Pydantic** | 2.5.0 | Data validation using Python type annotations |
| **scikit-learn** | 1.6+ | Machine learning library |
| **NumPy** | 2.0+ | Numerical computing |
| **Joblib** | 1.3+ | Model serialization |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **SQLite** | Embedded database |
| **Gmail SMTP** | Email delivery service |

---

## 💻 System Requirements

### Minimum Requirements

- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **CPU**: Dual-core processor

### Development Requirements

- **Docker**: 20.10+ and Docker Compose 2.0+
- **Node.js**: 18.0+ (for local frontend development)
- **Java**: 17+ (for local backend development)
- **Maven**: 3.9+ (for local backend development)
- **Python**: 3.9+ (for local ML service development)

---

## 🚀 Quick Start

### Prerequisites Setup

1. **Install Docker and Docker Compose**
   ```bash
   # Verify installation
   docker --version
   docker-compose --version
   ```

2. **Prepare ML Model Files**
   
   Ensure the following files exist in `ml-service/`:
   - `dementia_model.pkl` (required)
   - `scaler.pkl` (optional - auto-generated if missing)
   - `label_encoder.pkl` (optional - auto-generated if missing)
   
   If scaler and label_encoder are missing:
   ```bash
   cd ml-service
   python create_preprocessors.py
   ```

3. **Configure Email Service (Optional but Recommended)**
   
   Create a `.env` file in the project root:
   ```env
   EMAIL_USERNAME=your-email@gmail.com
   EMAIL_PASSWORD=your-16-character-app-password
   ```
   
   **Gmail App Password Setup:**
   - Enable 2-Step Verification on your Google Account
   - Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Generate a new app password for "Mail"
   - Use the 16-character password (NOT your regular Gmail password)

### Docker Deployment (Recommended)

1. **Clone/Navigate to Project Directory**
   ```bash
   cd AI_Powered_Dementia_Detection
   ```

2. **Build and Start All Services**
   ```bash
   docker-compose up --build
   ```
   
   This will:
   - Build Docker images for all services
   - Start ML Service on port 8000
   - Start Backend on port 8080
   - Start Frontend on port 3000
   - Configure networking between services

3. **Access the Application**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8080
   - **ML Service**: http://localhost:8000
   - **ML Service Health**: http://localhost:8000/health

4. **Stop Services**
   ```bash
   docker-compose down
   ```

### Local Development Setup

#### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend available at: http://localhost:3000

#### Backend (Spring Boot)

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Note**: Ensure the `data` directory exists:
```bash
mkdir -p backend/data
```

Backend available at: http://localhost:8080

#### ML Service (Python FastAPI)

```bash
cd ml-service
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

ML Service available at: http://localhost:8000

---

## 📚 API Documentation

### Base URLs

- **Backend API**: `http://localhost:8080/api`
- **ML Service API**: `http://localhost:8000`

### Authentication Endpoints

#### 1. User Registration

**Endpoint**: `POST /api/auth/signup`

**Description**: Register a new user account. Sends verification email.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "age": 45,
  "gender": "Male",
  "bloodGroup": "O+"
}
```

**Request Validation**:
- `email`: Required, valid email format
- `password`: Required, minimum 6 characters
- `firstName`: Required, non-blank
- `lastName`: Required, non-blank
- `age`: Required, integer between 0-120
- `gender`: Required, non-blank
- `bloodGroup`: Required, non-blank

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification code.",
  "userId": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "age": 45,
  "gender": "Male",
  "bloodGroup": "O+"
}
```

**Error Responses**:

- **400 Bad Request** - Validation failed:
```json
{
  "email": "Email must be valid",
  "password": "Password must be at least 6 characters"
}
```

- **400 Bad Request** - Email already exists:
```json
{
  "success": false,
  "message": "Email already registered"
}
```

- **500 Internal Server Error**:
```json
{
  "message": "An error occurred during signup: [error details]",
  "success": false
}
```

---

#### 2. User Login

**Endpoint**: `POST /api/auth/login`

**Description**: Authenticate user and return user information.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Request Validation**:
- `email`: Required, valid email format
- `password`: Required, non-blank

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Authentication successful",
  "userId": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "age": 45,
  "gender": "Male",
  "bloodGroup": "O+"
}
```

**Error Responses**:

- **401 Unauthorized** - Invalid credentials:
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

- **401 Unauthorized** - Email not verified:
```json
{
  "success": false,
  "message": "Please verify your email before logging in"
}
```

- **400 Bad Request** - Validation failed:
```json
{
  "email": "Email must be valid",
  "password": "Password is required"
}
```

---

#### 3. Email Verification

**Endpoint**: `POST /api/auth/verify-email`

**Description**: Verify user email with verification code sent during registration.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "verificationCode": "123456"
}
```

**Request Validation**:
- `email`: Required, valid email format
- `verificationCode`: Required, non-blank

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

**Error Responses**:

- **400 Bad Request** - Invalid or expired code:
```json
{
  "success": false,
  "message": "Invalid or expired verification code"
}
```

- **400 Bad Request** - User not found:
```json
{
  "success": false,
  "message": "User not found"
}
```

---

#### 4. Resend Verification Code

**Endpoint**: `POST /api/auth/resend-verification`

**Description**: Resend email verification code to user.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Request Validation**:
- `email`: Required, valid email format

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Verification code sent to your email"
}
```

**Error Responses**:

- **400 Bad Request** - User not found:
```json
{
  "success": false,
  "message": "User not found"
}
```

- **400 Bad Request** - Already verified:
```json
{
  "success": false,
  "message": "Email already verified"
}
```

---

### Assessment Endpoints

#### 5. Submit Assessment

**Endpoint**: `POST /api/assessment`

**Description**: Submit cognitive assessment data and receive risk prediction. Stores assessment in database and sends email notification.

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "age": 65,
  "reaction_time_ms": 300.0,
  "memory_score": 75.0,
  "speech_pause_ms": 500.0,
  "word_repetition_rate": 0.15,
  "task_error_rate": 0.1,
  "sleep_hours": 7.5,
  "userId": 1
}
```

**Request Validation**:
- `age`: Required, integer between 0-120
- `reaction_time_ms`: Required, positive number
- `memory_score`: Required, number between 0-100
- `speech_pause_ms`: Required, positive number
- `word_repetition_rate`: Required, number between 0-1
- `task_error_rate`: Required, number between 0-1
- `sleep_hours`: Required, number between 0-24
- `userId`: Optional, long integer (for linking to user)

**Success Response** (200 OK):
```json
{
  "riskLevel": "Low",
  "recommendation": "Maintain cognitive health monitoring. Continue regular assessments and healthy lifestyle practices."
}
```

**Risk Levels**:
- `Low`: Minimal risk indicators detected
- `Medium`: Moderate risk indicators present
- `High`: Significant risk indicators detected

**Error Responses**:

- **400 Bad Request** - Validation failed:
```json
{
  "message": "Validation failed",
  "errors": {
    "age": "Age must be between 0 and 120",
    "memory_score": "Memory score must be between 0 and 100"
  }
}
```

- **500 Internal Server Error** - ML Service unavailable:
```json
{
  "message": "An error occurred while processing the assessment: [error details]"
}
```

**Processing Flow**:
1. Validates request data
2. Sends data to ML Service for prediction
3. Stores assessment in database
4. Generates personalized recommendation
5. Sends email notification (if email configured)
6. Returns risk level and recommendation

---

#### 6. Get Assessment History

**Endpoint**: `GET /api/assessment/history/{userId}`

**Description**: Retrieve assessment history for a specific user.

**Path Parameters**:
- `userId` (Long, required): User ID

**Request Headers**: None required

**Success Response** (200 OK):
```json
[
  {
    "id": 1,
    "timestamp": "2024-01-15T10:30:00",
    "patientName": "John Doe",
    "age": 65,
    "riskLevel": "Low",
    "recommendation": "Maintain cognitive health monitoring..."
  },
  {
    "id": 2,
    "timestamp": "2024-01-20T14:45:00",
    "patientName": "John Doe",
    "age": 65,
    "riskLevel": "Medium",
    "recommendation": "Consider consulting with healthcare provider..."
  }
]
```

**Error Responses**:

- **500 Internal Server Error**:
```json
{
  "message": "An error occurred while fetching assessment history: [error details]"
}
```

---

### ML Service Endpoints

#### 7. ML Service Health Check

**Endpoint**: `GET /health`

**Description**: Check ML service health and model status.

**Success Response** (200 OK):
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_type": "RandomForestClassifier",
  "model_has_predict": true,
  "scaler_loaded": true,
  "label_encoder_loaded": true
}
```

---

#### 8. ML Service Root

**Endpoint**: `GET /`

**Description**: Get ML service information.

**Success Response** (200 OK):
```json
{
  "message": "Dementia Risk Assessment ML Service",
  "status": "running",
  "model_loaded": true
}
```

---

#### 9. Risk Prediction

**Endpoint**: `POST /predict`

**Description**: Get dementia risk prediction from ML model. (Internal endpoint, typically called by backend)

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "age": 65,
  "reaction_time_ms": 300.0,
  "memory_score": 75.0,
  "speech_pause_ms": 500.0,
  "word_repetition_rate": 0.15,
  "task_error_rate": 0.1,
  "sleep_hours": 7.5
}
```

**Request Validation**:
- `age`: Required, integer between 0-120
- `reaction_time_ms`: Required, positive number
- `memory_score`: Required, number between 0-100
- `speech_pause_ms`: Required, positive number
- `word_repetition_rate`: Required, number between 0-1
- `task_error_rate`: Required, number between 0-1
- `sleep_hours`: Required, number between 0-24

**Success Response** (200 OK):
```json
{
  "risk_level": "low"
}
```

**Possible Risk Levels**: `low`, `medium`, `high`

**Error Responses**:

- **500 Internal Server Error** - Model not loaded:
```json
{
  "detail": "Model not loaded"
}
```

- **422 Unprocessable Entity** - Validation failed:
```json
{
  "detail": [
    {
      "loc": ["body", "age"],
      "msg": "ensure this value is less than or equal to 120",
      "type": "value_error.number.not_le"
    }
  ]
}
```

---

## 🗄️ Database Schema

### Database Overview

**Database Type**: SQLite 3  
**Database File**: `backend/data/assessments.db`  
**Journal Mode**: WAL (Write-Ahead Logging)  
**Synchronous Mode**: NORMAL  
**Connection Pool**: HikariCP (max 3 connections)

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                │
├─────────────────────────────────────────────────────────────┤
│ PK │ id                    │ INTEGER                        │
│    │ email                 │ VARCHAR(255) UNIQUE NOT NULL   │
│    │ password              │ VARCHAR(255) NOT NULL          │
│    │ first_name            │ VARCHAR(255) NOT NULL         │
│    │ last_name             │ VARCHAR(255) NOT NULL         │
│    │ age                   │ INTEGER NOT NULL              │
│    │ gender                │ VARCHAR(50) NOT NULL          │
│    │ blood_group           │ VARCHAR(10) NOT NULL          │
│    │ created_at            │ DATETIME NOT NULL             │
│    │ email_verified        │ INTEGER DEFAULT 0             │
│    │ verification_code     │ VARCHAR(10)                    │
│    │ verification_code_    │ DATETIME                       │
│    │   expiry              │                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1
                            │
                            │
                            │ *
┌─────────────────────────────────────────────────────────────┐
│                      ASSESSMENTS                            │
├─────────────────────────────────────────────────────────────┤
│ PK │ id                    │ INTEGER                        │
│ FK │ user_id               │ INTEGER (nullable)            │
│    │ timestamp             │ DATETIME NOT NULL             │
│    │ age                   │ INTEGER NOT NULL              │
│    │ reaction_time_ms      │ REAL NOT NULL                 │
│    │ memory_score          │ REAL NOT NULL                 │
│    │ speech_pause_ms       │ REAL NOT NULL                 │
│    │ word_repetition_rate  │ REAL NOT NULL                 │
│    │ task_error_rate       │ REAL NOT NULL                 │
│    │ sleep_hours           │ REAL NOT NULL                 │
│    │ risk_label            │ VARCHAR(50) NOT NULL          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ID_GENERATOR                            │
├─────────────────────────────────────────────────────────────┤
│ PK │ gen_name              │ VARCHAR(255)                   │
│    │ gen_value             │ INTEGER NOT NULL              │
└─────────────────────────────────────────────────────────────┘
```

### Table Definitions

#### 1. Users Table

**Purpose**: Stores user account information, authentication data, and profile details.

**Table Name**: `users`

**SQL Definition**:
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(50) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    created_at DATETIME NOT NULL,
    email_verified INTEGER DEFAULT 0,
    verification_code VARCHAR(10),
    verification_code_expiry DATETIME
);

CREATE INDEX idx_users_email ON users(email);
```

**Field Descriptions**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier. Generated using table generator. |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | User's email address. Used for login and communication. Must be unique across all users. |
| `password` | VARCHAR(255) | NOT NULL | Hashed password. Should be encrypted using BCrypt or similar. |
| `first_name` | VARCHAR(255) | NOT NULL | User's first name. |
| `last_name` | VARCHAR(255) | NOT NULL | User's last name. |
| `age` | INTEGER | NOT NULL | User's age. Valid range: 0-120. |
| `gender` | VARCHAR(50) | NOT NULL | User's gender (e.g., "Male", "Female", "Other"). |
| `blood_group` | VARCHAR(10) | NOT NULL | User's blood group (e.g., "O+", "A-", "AB+"). |
| `created_at` | DATETIME | NOT NULL | Timestamp when user account was created. Format: ISO 8601. |
| `email_verified` | INTEGER | DEFAULT 0 | Boolean flag (0 = false, 1 = true). Indicates if email has been verified. |
| `verification_code` | VARCHAR(10) | NULLABLE | 6-digit verification code sent via email. Expires after set duration. |
| `verification_code_expiry` | DATETIME | NULLABLE | Expiration timestamp for verification code. |

**Indexes**:
- `idx_users_email`: Unique index on `email` for fast lookups during login and registration.

**Sample Data**:
```sql
INSERT INTO users (id, email, password, first_name, last_name, age, gender, blood_group, created_at, email_verified)
VALUES (1, 'john.doe@example.com', '$2a$10$hashedpassword...', 'John', 'Doe', 65, 'Male', 'O+', '2024-01-15 10:30:00', 1);
```

---

#### 2. Assessments Table

**Purpose**: Stores cognitive assessment results and risk predictions for users.

**Table Name**: `assessments`

**SQL Definition**:
```sql
CREATE TABLE assessments (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    age INTEGER NOT NULL,
    reaction_time_ms REAL NOT NULL,
    memory_score REAL NOT NULL,
    speech_pause_ms REAL NOT NULL,
    word_repetition_rate REAL NOT NULL,
    task_error_rate REAL NOT NULL,
    sleep_hours REAL NOT NULL,
    risk_label VARCHAR(50) NOT NULL,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_timestamp ON assessments(timestamp);
```

**Field Descriptions**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTO_INCREMENT | Unique assessment identifier. Generated using table generator. |
| `user_id` | INTEGER | FOREIGN KEY, NULLABLE | Reference to `users.id`. NULL for anonymous assessments. |
| `timestamp` | DATETIME | NOT NULL | When the assessment was performed. Format: ISO 8601. |
| `age` | INTEGER | NOT NULL | Age of the person at time of assessment. Valid range: 0-120. |
| `reaction_time_ms` | REAL | NOT NULL | Average reaction time in milliseconds. Must be positive. Typical range: 100-2000ms. |
| `memory_score` | REAL | NOT NULL | Memory recall score (0-100). Higher values indicate better memory. |
| `speech_pause_ms` | REAL | NOT NULL | Average speech pause duration in milliseconds. Must be positive. |
| `word_repetition_rate` | REAL | NOT NULL | Rate of word repetition (0-1). 0 = no repetition, 1 = high repetition. |
| `task_error_rate` | REAL | NOT NULL | Error rate in cognitive tasks (0-1). 0 = no errors, 1 = all errors. |
| `sleep_hours` | REAL | NOT NULL | Average hours of sleep per night. Valid range: 0-24. |
| `risk_label` | VARCHAR(50) | NOT NULL | ML model prediction. Values: "Low", "Medium", "High". |

**Indexes**:
- `idx_assessments_user_id`: Index on `user_id` for fast retrieval of user's assessment history.
- `idx_assessments_timestamp`: Index on `timestamp` for time-based queries and sorting.

**Foreign Key Constraints**:
- `user_id` → `users.id`: Cascading behavior depends on JPA configuration. Assessments can exist without a user (anonymous).

**Sample Data**:
```sql
INSERT INTO assessments (id, timestamp, age, reaction_time_ms, memory_score, speech_pause_ms, word_repetition_rate, task_error_rate, sleep_hours, risk_label, user_id)
VALUES (1, '2024-01-15 10:30:00', 65, 300.5, 75.0, 500.2, 0.15, 0.10, 7.5, 'Low', 1);
```

**Data Validation Rules**:
- `age`: 0 ≤ age ≤ 120
- `reaction_time_ms`: > 0
- `memory_score`: 0 ≤ memory_score ≤ 100
- `speech_pause_ms`: > 0
- `word_repetition_rate`: 0 ≤ rate ≤ 1
- `task_error_rate`: 0 ≤ rate ≤ 1
- `sleep_hours`: 0 ≤ hours ≤ 24
- `risk_label`: Must be one of: "Low", "Medium", "High"

---

#### 3. ID Generator Table

**Purpose**: Manages auto-increment sequences for entities using table-based ID generation (required for SQLite compatibility with JPA).

**Table Name**: `id_generator`

**SQL Definition**:
```sql
CREATE TABLE id_generator (
    gen_name VARCHAR(255) PRIMARY KEY,
    gen_value INTEGER NOT NULL
);
```

**Field Descriptions**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `gen_name` | VARCHAR(255) | PRIMARY KEY | Name of the generator sequence (e.g., "user_id", "assessment_id"). |
| `gen_value` | INTEGER | NOT NULL | Current value of the sequence. Incremented for each new entity. |

**Sample Data**:
```sql
INSERT INTO id_generator (gen_name, gen_value) VALUES ('user_id', 1);
INSERT INTO id_generator (gen_name, gen_value) VALUES ('assessment_id', 1);
```

**Usage**: This table is automatically managed by Hibernate/JPA. It ensures thread-safe ID generation in SQLite, which doesn't support native auto-increment sequences like other databases.

---

### Entity Relationships

#### Relationship Diagram

```
┌─────────────┐
│    USERS    │
│             │
│  id (PK)    │
└──────┬──────┘
       │
       │ One-to-Many
       │ (1 : N)
       │
       │ user_id (FK)
       │
┌──────▼──────────────┐
│   ASSESSMENTS       │
│                     │
│  id (PK)            │
│  user_id (FK)       │
└─────────────────────┘
```

#### Relationship Details

**Users ↔ Assessments**:
- **Type**: One-to-Many (1:N)
- **Cardinality**: One user can have zero or many assessments
- **Foreign Key**: `assessments.user_id` → `users.id`
- **Nullability**: `user_id` can be NULL (allows anonymous assessments)
- **Cascade**: No cascade delete (assessments preserved if user deleted)
- **Business Rule**: Assessments can be created without a user account (anonymous mode)

**Example Queries**:

```sql
-- Get all assessments for a user
SELECT a.* FROM assessments a
WHERE a.user_id = 1
ORDER BY a.timestamp DESC;

-- Get user with their assessment count
SELECT u.*, COUNT(a.id) as assessment_count
FROM users u
LEFT JOIN assessments a ON u.id = a.user_id
GROUP BY u.id;

-- Get latest assessment for each user
SELECT u.email, a.timestamp, a.risk_label
FROM users u
INNER JOIN assessments a ON u.id = a.user_id
WHERE a.timestamp = (
    SELECT MAX(timestamp) 
    FROM assessments 
    WHERE user_id = u.id
);
```

---

### Database Constraints Summary

| Constraint Type | Table | Field | Rule |
|----------------|-------|-------|------|
| PRIMARY KEY | users | id | Unique identifier |
| PRIMARY KEY | assessments | id | Unique identifier |
| PRIMARY KEY | id_generator | gen_name | Unique generator name |
| UNIQUE | users | email | Email must be unique |
| NOT NULL | users | email, password, first_name, last_name, age, gender, blood_group, created_at | Required fields |
| NOT NULL | assessments | timestamp, age, reaction_time_ms, memory_score, speech_pause_ms, word_repetition_rate, task_error_rate, sleep_hours, risk_label | Required fields |
| FOREIGN KEY | assessments | user_id | References users.id |
| CHECK | users | age | 0 ≤ age ≤ 120 (enforced in application) |
| CHECK | assessments | age | 0 ≤ age ≤ 120 (enforced in application) |
| CHECK | assessments | memory_score | 0 ≤ memory_score ≤ 100 (enforced in application) |
| CHECK | assessments | word_repetition_rate | 0 ≤ rate ≤ 1 (enforced in application) |
| CHECK | assessments | task_error_rate | 0 ≤ rate ≤ 1 (enforced in application) |
| CHECK | assessments | sleep_hours | 0 ≤ hours ≤ 24 (enforced in application) |

---

### Indexes and Performance

**Current Indexes**:

1. **`idx_users_email`** (users.email)
   - **Purpose**: Fast email lookups for login and registration
   - **Type**: Unique index
   - **Usage**: Login queries, email existence checks

2. **`idx_assessments_user_id`** (assessments.user_id)
   - **Purpose**: Fast retrieval of user's assessment history
   - **Type**: Non-unique index
   - **Usage**: `GET /api/assessment/history/{userId}` endpoint

3. **`idx_assessments_timestamp`** (assessments.timestamp)
   - **Purpose**: Time-based queries and sorting
   - **Type**: Non-unique index
   - **Usage**: Recent assessments, time-range queries

**Performance Considerations**:

- SQLite performs well for read-heavy workloads
- WAL mode enables concurrent reads
- Indexes optimize common query patterns
- For production with high write volume, consider PostgreSQL or MySQL
- Connection pool limited to 3 connections (SQLite best practice)

---

### Database Initialization

The database is automatically initialized by Hibernate/JPA on first startup:

1. **DDL Mode**: `spring.jpa.hibernate.ddl-auto=update`
   - Creates tables if they don't exist
   - Updates schema if entities change
   - **Production Warning**: Use `validate` or `none` in production

2. **Schema Generation**:
   - Tables created from JPA entities
   - Indexes created from `@Index` annotations
   - Foreign keys enforced by SQLite

3. **Initial Data**:
   - No seed data by default
   - ID generator initialized on first entity creation

**Manual Initialization** (if needed):

```sql
-- Create database file
sqlite3 backend/data/assessments.db

-- Run schema creation scripts
.read schema.sql

-- Verify tables
.tables

-- Check schema
.schema users
.schema assessments
```

---

### Data Types Reference

| SQLite Type | Java Type | Description |
|-------------|-----------|-------------|
| INTEGER | Long, Integer | 64-bit signed integer |
| REAL | Double, Float | Floating-point number |
| VARCHAR(n) | String | Variable-length string (max n characters) |
| DATETIME | LocalDateTime | Date and time (stored as TEXT in ISO 8601) |
| INTEGER (Boolean) | Boolean | 0 = false, 1 = true |

**Note**: SQLite uses dynamic typing, but JPA/Hibernate enforces type constraints through the application layer.

---

### Migration Notes

**From Development to Production**:

1. **Backup Current Database**:
   ```bash
   cp backend/data/assessments.db backend/data/assessments.db.backup
   ```

2. **Schema Changes**:
   - Update `ddl-auto` to `validate` in production
   - Use Flyway or Liquibase for version-controlled migrations
   - Test migrations on staging environment

3. **Data Migration** (if switching to PostgreSQL/MySQL):
   - Export SQLite data to CSV
   - Transform data types if needed
   - Import to new database
   - Verify data integrity

**Example Migration Script** (SQLite → PostgreSQL):

```sql
-- PostgreSQL equivalent
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 0 AND age <= 120),
    gender VARCHAR(50) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_code VARCHAR(10),
    verification_code_expiry TIMESTAMP
);
```

---

### Database Maintenance

**Backup**:
```bash
# SQLite backup
sqlite3 backend/data/assessments.db ".backup 'backup_$(date +%Y%m%d).db'"
```

**Vacuum** (reclaim space):
```sql
VACUUM;
```

**Analyze** (update statistics):
```sql
ANALYZE;
```

**Check Integrity**:
```sql
PRAGMA integrity_check;
```

**View Database Info**:
```sql
-- Table sizes
SELECT name, COUNT(*) as row_count 
FROM sqlite_master 
WHERE type='table' 
GROUP BY name;

-- Database size
SELECT page_count * page_size as size_bytes 
FROM pragma_page_count(), pragma_page_size();
```

---

## ⚙️ Configuration

### Backend Configuration

**File**: `backend/src/main/resources/application.properties`

```properties
# Server Configuration
server.port=8080
spring.application.name=dementia-risk-assessment

# Database Configuration
spring.datasource.url=jdbc:sqlite:./data/assessments.db?journal_mode=WAL&synchronous=NORMAL&busy_timeout=10000
spring.datasource.driver-class-name=org.sqlite.JDBC
spring.jpa.database-platform=org.hibernate.community.dialect.SQLiteDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Connection Pool (SQLite optimized)
spring.datasource.hikari.maximum-pool-size=3
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.connection-timeout=30000

# ML Service Configuration
ml.service.url=http://localhost:8000  # Use http://ml-service:8000 for Docker

# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true

# Email Configuration (Gmail SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${EMAIL_USERNAME:}
spring.mail.password=${EMAIL_PASSWORD:}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
app.email.from-name=Cortexa AI
```

### Frontend Configuration

**File**: `frontend/next.config.js`

```javascript
module.exports = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  }
}
```

**Docker Environment**: Set `NEXT_PUBLIC_API_URL=http://localhost:8080` in `docker-compose.yml`

### ML Service Configuration

**Model Files** (in `ml-service/` directory):
- `dementia_model.pkl` - Trained ML model (required)
- `scaler.pkl` - Feature scaler (auto-generated if missing)
- `label_encoder.pkl` - Label encoder (auto-generated if missing)

**Environment Variables**:
- `PYTHONUNBUFFERED=1` - For Docker logging

### Docker Compose Configuration

**File**: `docker-compose.yml`

Key configurations:
- **Networks**: All services on `dementia-network` bridge network
- **Volumes**: 
  - `./ml-service:/app` - ML service code
  - `./backend/data:/app/data` - Database persistence
- **Health Checks**: Configured for ML service and backend
- **Dependencies**: Backend depends on ML service health

---

## 🚢 Deployment

### Production Deployment Considerations

#### 1. Environment Variables

Create `.env` file:
```env
EMAIL_USERNAME=production-email@gmail.com
EMAIL_PASSWORD=production-app-password
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
ML_SERVICE_URL=http://ml-service:8000
```

#### 2. Database Migration

For production, consider migrating from SQLite to PostgreSQL or MySQL:

**PostgreSQL Example**:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/dementia_db
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

#### 3. Reverse Proxy (Nginx)

Example Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 4. SSL/TLS Configuration

- Use Let's Encrypt for free SSL certificates
- Configure HTTPS in Nginx
- Update CORS settings to allow HTTPS origins

#### 5. Monitoring and Logging

- **Application Logs**: Configure log rotation
- **Health Checks**: Set up monitoring for `/health` endpoints
- **Error Tracking**: Integrate Sentry or similar service
- **Metrics**: Use Prometheus + Grafana

#### 6. Scaling Considerations

- **Frontend**: Use CDN for static assets
- **Backend**: Deploy multiple instances behind load balancer
- **ML Service**: Consider GPU instances for model inference
- **Database**: Use connection pooling and read replicas

---

## 🔒 Security

### Security Best Practices

1. **Password Security**
   - Passwords are hashed (implementation should use BCrypt)
   - Minimum 6 characters enforced
   - Consider implementing password strength requirements

2. **Email Verification**
   - Verification codes expire after set time
   - Codes are randomly generated
   - Prevents unauthorized account creation

3. **CORS Configuration**
   - Restricted to specific origins
   - Credentials allowed only for trusted domains
   - Update for production domains

4. **Input Validation**
   - All endpoints validate request data
   - Type checking and range validation
   - SQL injection prevention via JPA

5. **API Security** (Production Recommendations)
   - Implement JWT tokens for authentication
   - Add rate limiting
   - Use HTTPS only
   - Implement API key authentication for ML service
   - Add request signing for sensitive endpoints

6. **Database Security**
   - SQLite file permissions restricted
   - Consider encrypted database for production
   - Regular backups

7. **Email Security**
   - Use App Passwords (not regular passwords)
   - TLS encryption for SMTP
   - Email content sanitization

### Security Checklist for Production

- [ ] Enable HTTPS/TLS
- [ ] Implement JWT authentication
- [ ] Add rate limiting
- [ ] Configure CORS for production domains
- [ ] Use environment variables for secrets
- [ ] Implement database encryption
- [ ] Set up security headers
- [ ] Enable request logging
- [ ] Implement audit trails
- [ ] Regular security updates

---

## 🐛 Troubleshooting

### Common Issues and Solutions

#### ML Service Issues

**Problem**: ML service fails to load model

**Solutions**:
1. Verify `dementia_model.pkl` exists in `ml-service/` directory
2. Run `create_preprocessors.py` to generate missing preprocessor files
3. Check service logs: `docker-compose logs ml-service`
4. Verify Python dependencies: `pip install -r requirements.txt`
5. Check model file compatibility with scikit-learn version

**Problem**: Prediction returns incorrect risk levels

**Solutions**:
1. Verify model was trained with same feature order
2. Check scaler compatibility
3. Validate input data ranges
4. Review model training data distribution

#### Backend Database Issues

**Problem**: Backend cannot create database

**Solutions**:
1. Ensure `backend/data` directory exists and is writable
2. Check file permissions: `chmod 755 backend/data`
3. Verify SQLite JDBC driver version
4. Check backend logs: `docker-compose logs backend`
5. Clear database and restart: `rm backend/data/assessments.db`

**Problem**: Database locked errors

**Solutions**:
1. SQLite WAL mode is enabled (should prevent most lock issues)
2. Reduce connection pool size
3. Check for long-running transactions
4. Consider migrating to PostgreSQL for production

#### CORS Issues

**Problem**: CORS errors in browser console

**Solutions**:
1. Verify CORS configuration in `CorsConfig.java`
2. Ensure frontend URL matches allowed origins
3. Check for trailing slashes in URLs
4. Verify `Access-Control-Allow-Credentials` header
5. For production, update allowed origins

#### Email Service Issues

**Problem**: Emails not sending

**Solutions**:
1. Verify `.env` file exists with correct credentials
2. Use Gmail App Password (not regular password)
3. Enable 2-Step Verification on Google Account
4. Check SMTP connection timeout settings
5. Verify email service logs in backend
6. Test SMTP connection independently

**Problem**: "Less secure app" error

**Solutions**:
1. Use App Password instead of regular password
2. Enable 2-Step Verification
3. Generate new App Password from Google Account settings

#### Port Conflicts

**Problem**: Port already in use

**Solutions**:
1. Find process using port:
   ```bash
   # Windows
   netstat -ano | findstr :8080
   
   # Linux/Mac
   lsof -i :8080
   ```
2. Kill process or change port in configuration
3. Update `docker-compose.yml` port mappings
4. Update frontend API URL accordingly

#### Docker Issues

**Problem**: Containers fail to start

**Solutions**:
1. Check Docker daemon is running
2. Verify Docker Compose version: `docker-compose --version`
3. Check logs: `docker-compose logs`
4. Rebuild images: `docker-compose build --no-cache`
5. Check disk space: `docker system df`
6. Verify network connectivity between containers

---

## 👨‍💻 Development

### Project Structure

```
AI_Powered_Dementia_Detection/
│
├── frontend/                    # Next.js frontend application
│   ├── components/             # React components
│   │   ├── AccountCreation.tsx
│   │   ├── AssessmentHistory.tsx
│   │   ├── LifestyleForm.tsx
│   │   ├── MemoryTest.tsx
│   │   ├── PuzzleTest.tsx
│   │   ├── ReactionTest.tsx
│   │   ├── SpeechTest.tsx
│   │   └── ...
│   ├── pages/                  # Next.js pages
│   │   ├── index.tsx
│   │   └── api/
│   ├── styles/                 # CSS modules
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── backend/                     # Spring Boot backend service
│   ├── src/
│   │   └── main/
│   │       ├── java/com/dementia/riskassessment/
│   │       │   ├── config/     # Configuration classes
│   │       │   ├── controller/ # REST controllers
│   │       │   ├── dto/        # Data Transfer Objects
│   │       │   ├── entity/     # JPA entities
│   │       │   ├── repository/ # Data repositories
│   │       │   └── service/    # Business logic
│   │       └── resources/
│   │           └── application.properties
│   ├── data/                   # SQLite database directory
│   ├── pom.xml
│   └── Dockerfile
│
├── ml-service/                  # Python FastAPI ML service
│   ├── code snippets/          # Reference code
│   ├── main.py                 # FastAPI application
│   ├── create_preprocessors.py # Preprocessor generation
│   ├── requirements.txt
│   ├── Dockerfile
│   └── *.pkl                   # Model files
│
├── docker-compose.yml           # Docker orchestration
├── .env                         # Environment variables (create this)
└── README.md                    # This file
```

### Building Individual Services

```bash
# Frontend
cd frontend
docker build -t dementia-frontend .

# Backend
cd backend
docker build -t dementia-backend .

# ML Service
cd ml-service
docker build -t dementia-ml-service .
```

### Running Tests

```bash
# Backend tests
cd backend
mvn test

# Frontend tests (if configured)
cd frontend
npm test

# ML Service tests (if configured)
cd ml-service
pytest
```

### Code Style Guidelines

- **Java**: Follow Google Java Style Guide
- **TypeScript/React**: Use ESLint with Next.js config
- **Python**: Follow PEP 8, use Black formatter
- **Commit Messages**: Use conventional commits format

### Adding New Features

1. **New API Endpoint**:
   - Add controller method in `AssessmentController` or `AuthController`
   - Create DTOs in `dto/` package
   - Implement service logic in `service/` package
   - Add repository methods if needed
   - Update API documentation

2. **New Frontend Component**:
   - Create component in `components/`
   - Add TypeScript types
   - Style with CSS modules
   - Integrate with API

3. **New ML Feature**:
   - Update `PredictionRequest` model
   - Modify preprocessing in `main.py`
   - Retrain model with new features
   - Update backend DTOs

---

## ⚠️ Medical Disclaimer

**IMPORTANT**: This application is a cognitive risk screening tool and **NOT** a medical diagnosis system. 

- The system is designed for **risk stratification purposes only**
- Results should **NOT** be used as a substitute for professional medical advice
- All assessments should be reviewed by qualified healthcare professionals
- The system is intended for **educational and research purposes**
- Users should consult healthcare providers for medical decisions
- The ML model predictions are probabilistic and may have limitations
- False positives and false negatives are possible

**For Medical Emergencies**: Contact your local emergency services immediately.

---

## 📄 License

This project is for educational and research purposes only.

---

## 📞 Support

### Getting Help

1. **Check Logs**:
   ```bash
   docker-compose logs -f
   ```

2. **Service-Specific Logs**:
   ```bash
   docker-compose logs -f ml-service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   ```

3. **Health Checks**:
   - Backend: http://localhost:8080/actuator/health
   - ML Service: http://localhost:8000/health
   - Frontend: http://localhost:3000/api/health

### Common Commands

```bash
# View all logs
docker-compose logs -f

# Restart specific service
docker-compose restart backend

# Rebuild and restart
docker-compose up --build -d

# Stop all services
docker-compose down

# Remove volumes (clean database)
docker-compose down -v
```

---

## 🎯 Future Enhancements

Potential improvements for production:

- [ ] JWT-based authentication
- [ ] Role-based access control (RBAC)
- [ ] Real-time assessment dashboard
- [ ] Advanced ML model with deep learning
- [ ] Multi-language support
- [ ] Mobile application
- [ ] Integration with electronic health records (EHR)
- [ ] Advanced analytics and reporting
- [ ] Automated report generation
- [ ] Telemedicine integration
- [ ] HIPAA compliance features
- [ ] Audit logging system
- [ ] Performance monitoring
- [ ] Automated testing suite
- [ ] CI/CD pipeline

---

**Version**: 1.0.0  
**Last Updated**: 2026  
**Maintainer**: Jerophin D R
