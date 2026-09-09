@echo off
echo ========================================================
echo   LUMORA — AI Workload & Recovery Autopilot
echo   Know Your Load. Protect Your Energy.
echo ========================================================
echo.
echo Starting Backend (FastAPI on http://127.0.0.1:8000)...
start "Lumora Backend" cmd /k "python backend_server.py"
timeout /t 2 >nul

echo Starting Frontend (Vite on http://localhost:5173)...
cd frontend
start "Lumora Frontend" cmd /k "npm run dev"
echo.
echo Lumora is starting!
echo Visit: http://localhost:5173
echo.
pause
