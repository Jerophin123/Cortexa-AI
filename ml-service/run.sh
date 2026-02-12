#!/bin/bash
# Shell script to run the ML Service
# Usage: ./run.sh

echo "Starting Dementia Risk Assessment ML Service..."

# Check if virtual environment exists
if [ ! -f "venv/bin/activate" ]; then
    echo "Error: Virtual environment not found!"
    echo "Please create a virtual environment first:"
    echo "  python3 -m venv venv"
    echo "  source venv/bin/activate"
    echo "  pip install -r requirements.txt"
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Check if required packages are installed
echo "Checking dependencies..."
if ! python -c "import uvicorn" 2>/dev/null; then
    echo "Installing dependencies..."
    python -m pip install -r requirements.txt
fi

# Check if model files exist
if [ ! -f "dementia_model.pkl" ]; then
    echo "Warning: dementia_model.pkl not found!"
    echo "The service will create a dummy model for testing."
fi

if [ ! -f "scaler.pkl" ]; then
    echo "Warning: scaler.pkl not found!"
    echo "Creating preprocessors..."
    python create_preprocessors.py
fi

if [ ! -f "label_encoder.pkl" ]; then
    echo "Warning: label_encoder.pkl not found!"
    echo "Creating preprocessors..."
    python create_preprocessors.py
fi

# Run the service
echo ""
echo "Starting ML Service on http://0.0.0.0:8000"
echo "API Documentation: http://localhost:8000/docs"
echo "Health Check: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8000 --reload

