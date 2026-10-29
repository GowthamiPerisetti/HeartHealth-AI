@echo off
echo ====================================================
echo Starting HeartHealth AI Backend (FastAPI + Uvicorn)
echo ====================================================
call .\venv\Scripts\activate.bat
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
pause
