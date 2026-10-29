Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Running HeartHealth AI Test Suite (Pytest + Frontend)" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
& .\venv\Scripts\pytest.exe -o pythonpath=. tests/
Push-Location frontend
npm run build
Pop-Location
