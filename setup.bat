@echo off
REM Windows setup script

echo.
echo ======================================
echo   Customer Support Chatbot - Setup
echo ======================================
echo.

REM Check Node.js
echo Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js 18+
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo OK: Node.js %NODE_VERSION%
echo.

REM Check npm
echo Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm not found
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo OK: npm %NPM_VERSION%
echo.

REM Backend setup
echo Setting up Backend...
cd backend
if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
    echo WARNING: Please fill in MongoDB, Redis, and JWT_SECRET in backend\.env
)
call npm install
echo OK: Backend dependencies installed
echo.

REM Frontend setup
cd ..\frontend
echo Setting up Frontend...
if not exist ".env.local" (
    echo Creating .env.local from .env.example...
    copy .env.example .env.local
    echo OK: Frontend .env.local created
)
call npm install
echo OK: Frontend dependencies installed
echo.

echo ======================================
echo   Setup Complete!
echo ======================================
echo.
echo Next steps:
echo 1. Edit backend\.env (MongoDB and Redis connection strings)
echo 2. Start Backend: cd backend ^&^& npm run dev
echo 3. Start Worker: cd backend ^&^& npm run worker:dev (in new terminal)
echo 4. Start Frontend: cd frontend ^&^& npm run dev (in new terminal)
echo.
echo See QUICK_START.md for more details
echo.

