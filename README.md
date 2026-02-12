# Dementia Risk Assessment System

A full-stack AI-based Early-Stage Dementia Risk Stratification application with a modular microservices architecture.

## Architecture

- **Frontend**: Next.js (React) - Multi-step assessment form with medical-style UI
- **Backend**: Spring Boot - REST API with validation and database integration
- **ML Service**: Python FastAPI - Machine learning prediction service
- **Database**: SQLite - Stores assessment results

## Project Structure

```
dementia-system/
│
├── frontend/          # Next.js frontend application
├── backend/           # Spring Boot backend service
├── ml-service/        # Python FastAPI ML microservice
├── docker-compose.yml # Docker Compose configuration
└── README.md          # This file
```

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Java 17+ (for local backend development)
- Python 3.9+ (for local ML service development)
- Maven 3.9+ (for local backend development)

## Quick Start with Docker

1. **Clone or navigate to the project directory**

2. **Ensure ML model files exist**:
   - `ml-service/dementia_model.pkl` (required)
   - `ml-service/scaler.pkl` (optional - will be created if missing)
   - `ml-service/label_encoder.pkl` (optional - will be created if missing)

   If scaler and label_encoder are missing, you can create them by running:
   ```bash
   cd ml-service
   python create_preprocessors.py
   ```

3. **Build and start all services**:
   ```bash
   docker-compose up --build
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - ML Service: http://localhost:8000

## Local Development Setup

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000

### Backend (Spring Boot)

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

The backend will be available at http://localhost:8080

**Note**: Ensure the `data` directory exists in the backend folder for SQLite:
```bash
mkdir -p backend/data
```

### ML Service (Python FastAPI)

```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The ML service will be available at http://localhost:8000

## API Endpoints

### Backend API

- **POST** `/api/assessment` - Submit assessment and get risk prediction
  - Request Body:
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
  - Response:
    ```json
    {
      "riskLevel": "Low",
      "recommendation": "Maintain cognitive health monitoring..."
    }
    ```

### ML Service API

- **GET** `/` - Service status
- **GET** `/health` - Health check
- **POST** `/predict` - Get risk prediction
  - Request Body: Same as backend assessment request
  - Response:
    ```json
    {
      "risk_level": "low"
    }
    ```

## Assessment Flow

1. **Step 1**: Speech Task - Enter speech pause duration and word repetition rate
2. **Step 2**: Memory Recall - Enter memory score (0-100)
3. **Step 3**: Reaction Time - Enter average reaction time in milliseconds
4. **Step 4**: Task Performance - Enter task error rate (0-1)
5. **Step 5**: Lifestyle Information - Enter sleep hours and age

After submission, the system:
1. Validates input data
2. Sends data to ML service for prediction
3. Stores assessment in SQLite database
4. Returns risk level (Low/Medium/High) with recommendation

## Database Schema

The SQLite database (`assessments.db`) contains the following table:

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
    risk_label TEXT NOT NULL
);
```

## Configuration

### Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
server.port=8080
spring.datasource.url=jdbc:sqlite:./data/assessments.db
ml.service.url=http://ml-service:8000
```

### Frontend Configuration

The frontend is configured to connect to `http://localhost:8080` by default. For Docker, update the API URL in `frontend/pages/index.tsx` if needed.

### ML Service Configuration

The ML service expects:
- `dementia_model.pkl` - Trained model file
- `scaler.pkl` - Feature scaler (created automatically if missing)
- `label_encoder.pkl` - Label encoder (created automatically if missing)

## Important Notes

⚠️ **Medical Disclaimer**: This is a cognitive risk screening tool and not a medical diagnosis. The system is designed for risk stratification purposes only and should not be used as a substitute for professional medical advice.

## Troubleshooting

### ML Service Issues

If the ML service fails to load the model:
1. Ensure `dementia_model.pkl` exists in `ml-service/` directory
2. Run `create_preprocessors.py` to generate missing preprocessor files
3. Check service logs: `docker-compose logs ml-service`

### Backend Database Issues

If the backend cannot create the database:
1. Ensure the `backend/data` directory exists and is writable
2. Check backend logs: `docker-compose logs backend`

### CORS Issues

If you encounter CORS errors:
1. Verify CORS configuration in `backend/src/main/java/com/dementia/riskassessment/config/CorsConfig.java`
2. Ensure frontend URL matches the allowed origins

### Port Conflicts

If ports are already in use:
1. Modify port mappings in `docker-compose.yml`
2. Update frontend API URL accordingly

## Development

### Building Individual Services

```bash
# Frontend
cd frontend && docker build -t dementia-frontend .

# Backend
cd backend && docker build -t dementia-backend .

# ML Service
cd ml-service && docker build -t dementia-ml-service .
```

### Running Tests

```bash
# Backend tests
cd backend && mvn test

# Frontend tests (if configured)
cd frontend && npm test
```

## License

This project is for educational and research purposes only.

## Support

For issues or questions, please check the logs:
```bash
docker-compose logs -f
```




