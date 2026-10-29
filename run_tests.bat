@echo off
echo ====================================================
echo Running HeartHealth AI Test Suite (Pytest + Frontend)
echo ====================================================
call .\venv\Scripts\activate.bat
pytest -o pythonpath=. tests/
cd frontend
npm run build
cd ..
pause
