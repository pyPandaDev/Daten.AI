@echo off
echo Starting Data Analysis Agent Frontend...
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting Vite development server...
call npm run dev
