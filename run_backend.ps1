Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Starting HeartHealth AI Backend (FastAPI + Uvicorn)" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
& .\venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
