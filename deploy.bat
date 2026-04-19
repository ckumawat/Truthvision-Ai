@echo off
REM TruthVision AI - Deployment Script for Windows
REM This script automates the deployment process on Windows

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo TruthVision AI - Windows Deployment Script
echo ==========================================
echo.

REM Check prerequisites
echo [INFO] Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [SUCCESS] Node.js: %NODE_VERSION%

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo [SUCCESS] npm: %NPM_VERSION%

echo.

REM Setup environment
echo [INFO] Setting up environment...

if not exist .env (
    if not exist .env.example (
        echo [ERROR] .env.example not found
        exit /b 1
    )
    copy .env.example .env
    echo [SUCCESS] .env file created from template
    echo [WARNING] Please edit .env with your production values
    pause
) else (
    echo [SUCCESS] .env file already exists
)

echo.

REM Install dependencies
echo [INFO] Installing dependencies...
call npm ci --only=production
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies
    exit /b 1
)
echo [SUCCESS] Dependencies installed successfully

echo.

REM Create uploads directory
if not exist uploads (
    mkdir uploads
    echo [SUCCESS] Created uploads directory
)

REM Create logs directory
if not exist logs (
    mkdir logs
    echo [SUCCESS] Created logs directory
)

echo.

REM Start application
echo [INFO] Starting application...

REM Check if PM2 is installed
where pm2 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    call pm2 start backend/server.js --name truthvision-ai
    call pm2 save
    echo [SUCCESS] Application started with PM2
    echo [INFO] View logs: pm2 logs truthvision-ai
    echo [INFO] Monitor: pm2 monit
) else (
    echo [INFO] Starting application directly...
    start "TruthVision AI" cmd /k node backend/server.js
    echo [SUCCESS] Application started
    echo [WARNING] Consider installing PM2 for production: npm install -g pm2
)

echo.

REM Verify deployment
echo [INFO] Verifying deployment...
timeout /t 2 /nobreak

powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3002' -UseBasicParsing -TimeoutSec 5; echo '[SUCCESS] Server is responding' } catch { echo '[WARNING] Server may not be ready yet' }"

echo.
echo ==========================================
echo [SUCCESS] Deployment completed!
echo ==========================================
echo.
echo Application Details:
echo   - URL: http://localhost:3002
echo.
echo Next steps:
echo   1. Access the application: http://localhost:3002
echo   2. Monitor logs: pm2 logs truthvision-ai
echo   3. Setup SSL: Configure nginx for HTTPS
echo.

pause
