# ML Service

FastAPI microservice for dementia risk prediction.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Ensure model files exist:
   - `dementia_model.pkl` (required)
   - `scaler.pkl` (optional - will be created if missing)
   - `label_encoder.pkl` (optional - will be created if missing)

3. If preprocessors are missing, run:
```bash
python create_preprocessors.py
```

4. Run the service:

**Option A: Using the run script (Recommended)**

**Windows (PowerShell):**
```powershell
.\run.ps1
```

**Linux/Mac:**
```bash
chmod +x run.sh
./run.sh
```

**Option B: Using Python directly:**
```bash
python main.py
```

**Option C: Using uvicorn directly:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

- `GET /` - Service status
- `GET /health` - Health check
- `POST /predict` - Get risk prediction

