@echo off
echo ===================================================
echo   Three.js Realistic Lighting & Mobile Studio Setup
echo ===================================================
echo.
echo [1/3] Checking Node.js environment...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [2/3] Installing project dependencies...
call npm install

echo.
echo [3/3] Launching Studio Dev Server & Browser...
start "" http://localhost:5173/
call npm run dev -- --host
