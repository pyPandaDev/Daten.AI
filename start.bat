@echo off
echo ========================================
echo  Data Science Platform - Quick Start
echo ========================================
echo.

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)

echo.
echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo ========================================
echo Starting Backend Server...
echo ========================================
cd backend

if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate

if not exist "..\\.env" (
    echo.
    echo WARNING: .env file not found!
    echo Please copy .env.example to .env and add your GEMINI_API_KEY
    echo.
    pause
)

echo Installing/Updating dependencies...
pip install -r requirements.txt --quiet

echo.
echo Starting FastAPI backend server...
start cmd /k "title Backend Server && cd /d %CD% && venv\Scripts\activate && python -m uvicorn app.main:app --reload"

cd ..

echo.
echo ========================================
echo Starting Frontend Development Server...
echo ========================================
cd frontend

if not exist "node_modules" (
    echo Installing npm dependencies...
    call npm install
)

echo.
echo Starting Vite development server...
start cmd /k "title Frontend Server && cd /d %CD% && npm run dev"

cd ..

echo.
echo ========================================
echo  Servers are starting...
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to open the application in your browser...
pause > nul

start http://localhost:5173

echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause
