Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "       STUDENT360 - ACADEMIC INTELLIGENCE PLATFORM       " -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "Starting Backend (FastAPI on Port 8000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn app.main:app --reload --port 8000"

Start-Sleep -Seconds 2

Write-Host "Starting Frontend (Vite on Port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npx vite --port 5173 --host 127.0.0.1"

Start-Sleep -Seconds 2

Write-Host "Opening Application..." -ForegroundColor Green
Start-Process "http://127.0.0.1:5173"

Write-Host "System Active!" -ForegroundColor Cyan
Write-Host "  Homepage:  http://127.0.0.1:5173"
Write-Host "  Login:     http://127.0.0.1:5173/login"
Write-Host "  Register:  http://127.0.0.1:5173/register"
Write-Host "  API Docs:  http://127.0.0.1:8000/docs"

