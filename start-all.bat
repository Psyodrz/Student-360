@echo off
echo ========================================================
echo        STUDENT360 - ACADEMIC INTELLIGENCE PLATFORM
echo ========================================================
echo Starting Backend (FastAPI on Port 8000)...
start "Student360 Backend" cmd /k "cd backend && python -m uvicorn app.main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo Starting Frontend (Vite on Port 5173)...
start "Student360 Frontend" cmd /k "cd frontend && npx vite --port 5173 --host 127.0.0.1"

timeout /t 2 /nobreak >nul

echo ========================================================
echo  System running!
echo  Frontend URL: http://127.0.0.1:5173
echo  Backend API:  http://127.0.0.1:8000
echo  API Docs:     http://127.0.0.1:8000/docs
echo ========================================================
start http://127.0.0.1:5173
pause

