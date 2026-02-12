# How to Run ML Service

## Option 1: Run Locally with Virtual Environment (Recommended for Development)

### Step 1: Activate Virtual Environment

**Windows (PowerShell):**
```powershell
cd ml-service
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
cd ml-service
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
cd ml-service
source venv/bin/activate
```

### Step 2: Install Dependencies (if not already installed)

```bash
pip install -r requirements.txt
```

### Step 3: Create Preprocessors (if missing)

If `scaler.pkl` or `label_encoder.pkl` don't exist, create them:

```bash
python create_preprocessors.py
```

### Step 4: Run the Service

**Option A: Using the run script (Recommended - Easiest)**

**Windows (PowerShell):**
```powershell
.\run.ps1
```

**Linux/Mac:**
```bash
chmod +x run.sh
./run.sh
```

The run script will:
- Automatically activate the virtual environment
- Check and install dependencies if needed
- Create missing preprocessor files
- Start the service with auto-reload enabled

**Option B: Using Python directly**
```bash
python main.py
```

**Option C: Using uvicorn directly**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The `--reload` flag enables auto-reload on code changes (useful for development).

### Step 5: Verify Service is Running

- Service will be available at: **http://localhost:8000**
- API Documentation: **http://localhost:8000/docs** (Swagger UI)
- Alternative Docs: **http://localhost:8000/redoc** (ReDoc)
- Health Check: **http://localhost:8000/health**

## Option 2: Run with Docker

### Build and Run

```bash
cd ml-service
docker build -t dementia-ml-service .
docker run -p 8000:8000 dementia-ml-service
```

Or from the project root:

```bash
docker-compose up ml-service
```

## Option 3: Run All Services Together

From the project root directory:

```bash
docker-compose up
```

This will start:
- ML Service on port 8000
- Backend on port 8080
- Frontend on port 3000

## Testing the ML Service

### Test with curl:

```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "age": 65,
    "reaction_time_ms": 300.0,
    "memory_score": 75.0,
    "speech_pause_ms": 500.0,
    "word_repetition_rate": 0.15,
    "task_error_rate": 0.1,
    "sleep_hours": 7.5
  }'
```

### Test with PowerShell (Windows):

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/predict" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{
    "age": 65,
    "reaction_time_ms": 300.0,
    "memory_score": 75.0,
    "speech_pause_ms": 500.0,
    "word_repetition_rate": 0.15,
    "task_error_rate": 0.1,
    "sleep_hours": 7.5
  }'
```

## Troubleshooting

### Issue: Module not found errors
**Solution:** Make sure virtual environment is activated and dependencies are installed:
```bash
pip install -r requirements.txt
```

### Issue: Model file not found
**Solution:** The service will create a dummy model if `dementia_model.pkl` is missing, but for production, ensure the model file exists in the `ml-service` directory.

### Issue: Port 8000 already in use
**Solution:** Change the port:
```bash
uvicorn main:app --host 0.0.0.0 --port 8001
```
Then update the backend configuration to use port 8001.

### Issue: Preprocessors missing
**Solution:** Run the preprocessor creation script:
```bash
python create_preprocessors.py
```

## Quick Start (Windows PowerShell)

```powershell
# Navigate to ml-service directory
cd ml-service

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install/update dependencies
pip install -r requirements.txt

# Create preprocessors if needed
python create_preprocessors.py

# Run the service
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

