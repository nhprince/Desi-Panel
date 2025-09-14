@echo off
SETLOCAL EnableDelayedExpansion

:: --- ASCII Logo ---
echo.
echo   ██████╗ ███████╗███████╗██╗     
echo   ██╔═══██╗██╔════╝██╔════╝██║     
echo   ██║   ██║███████╗███████╗██║     
echo   ██║   ██║╚════██║╚════██║██║     
echo   ██████╔╝███████║███████║███████╗
echo   ╚═════╝ ╚══════╝╚══════╝╚══════╝
echo     ██████╗  █████╗ ███╗   ██╗███████╗██╗
echo     ██╔══██╗██╔══██╗████╗  ██║██╔════╝██║
echo     ██████╔╝███████║██╔██╗ ██║█████╗  ██║
echo     ██╔═══╝ ██╔══██║██║╚██╗██║██╔══╝  ██║
echo     ██║     ██║  ██║██║ ╚████║███████╗███████╗
echo     ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
echo.
echo Welcome to the Desi Panel Installer for Windows
echo This script will help you configure your local development environment.
echo.

:: --- Prerequisite Check ---
echo Checking prerequisites...
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: npm is not found. Please install Node.js and npm, then re-run the script.
    goto :eof
)
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: git is not found. Please install Git, then re-run the script.
    goto :eof
)
echo Prerequisites met.
echo.


:: --- Database Configuration ---
echo --- Database Configuration ---
:db_choice
set /p USE_SQLITE="For easy local testing, do you want to use SQLite? (Y/n): "
if /i "%USE_SQLITE%"=="Y" goto :sqlite_setup
if /i "%USE_SQLITE%"=="" goto :sqlite_setup
if /i "%USE_SQLITE%"=="n" goto :postgres_setup
echo Invalid choice. Please enter 'Y' or 'n'.
goto :db_choice

:sqlite_setup
set DB_CONFIG_LINE=USE_SQLITE=1
goto :security_setup

:postgres_setup
:db_url_loop
set /p DATABASE_URL="Enter the PostgreSQL URL (e.g., postgres://user:pass@localhost:5432/desipanel): "
if defined DATABASE_URL (
    set DB_CONFIG_LINE=DATABASE_URL=!DATABASE_URL!
    goto :security_setup
) else (
    echo Database URL cannot be empty.
    goto :db_url_loop
)


:security_setup
:: --- Security Configuration ---
echo.
echo --- Security Configuration ---
:jwt_loop
set /p JWT_SECRET="Enter a strong, random JWT Secret (at least 16 characters): "
if not defined JWT_SECRET (
    echo JWT Secret cannot be empty.
    goto :jwt_loop
)
set str=!JWT_SECRET!
set /a len=0
:len_loop
if defined str ( 
    set str=!str:~1!
    set /a len+=1
    goto :len_loop
)
if !len! lss 16 (
    echo JWT Secret must be at least 16 characters long for security.
    goto :jwt_loop
)

:: --- Control Panel Admin Credentials ---
echo.
echo --- Control Panel Admin Credentials ---
echo Set the initial login for the Desi Panel web interface.
:email_loop
set /p ADMIN_EMAIL="Admin Email: "
if not defined ADMIN_EMAIL (  rem Basic check, can't do regex easily in batch
    echo Email cannot be empty.
    goto :email_loop
)

:password_loop
set /p ADMIN_PASSWORD="Admin Password (min 8 characters, will be visible): "
if not defined ADMIN_PASSWORD (
    echo Password cannot be empty.
    goto :password_loop
)
set str=!ADMIN_PASSWORD!
set /a len=0
:len_loop_pass
if defined str ( 
    set str=!str:~1!
    set /a len+=1
    goto :len_loop_pass
)
if !len! lss 8 (
    echo Password must be at least 8 characters long.
    goto :password_loop
)


:: --- Application Settings ---
echo.
echo --- Application Settings ---
set FRONTEND_ORIGIN_DEFAULT=http://localhost:5173
set FILES_ROOT_DEFAULT=%CD%\storage

set /p FRONTEND_ORIGIN="Enter the Frontend Origin URL [%FRONTEND_ORIGIN_DEFAULT%]: "
if not defined FRONTEND_ORIGIN set FRONTEND_ORIGIN=%FRONTEND_ORIGIN_DEFAULT%

set /p FILES_ROOT="Enter the root directory for user files [%FILES_ROOT_DEFAULT%]: "
if not defined FILES_ROOT set FILES_ROOT=%FILES_ROOT_DEFAULT%



:: --- Create Environment File ---
set ENV_FILE=backend\.env
echo.
echo Creating environment file at %ENV_FILE%...
if not exist backend mkdir backend

(
    echo # Backend Server Configuration
    echo PORT=4000
    echo NODE_ENV=development
    echo.
    echo # Database
    echo !DB_CONFIG_LINE!
    echo.
    echo # Security
    echo JWT_SECRET=!JWT_SECRET!
    echo FRONTEND_ORIGIN=!FRONTEND_ORIGIN!
    echo.
    echo # Initial Admin User (for first run)
    echo ADMIN_EMAIL=!ADMIN_EMAIL!
    echo ADMIN_PASSWORD=!ADMIN_PASSWORD!
    echo.
    echo # File System
    echo FILES_ROOT=!FILES_ROOT!
) > %ENV_FILE%

echo Successfully wrote configuration to %ENV_FILE%
echo.

:: --- Frontend Env File ---
set FRONTEND_ENV_FILE=frontend\.env
echo.
echo Creating frontend environment file at %FRONTEND_ENV_FILE%...
if not exist frontend mkdir frontend
(
    echo VITE_API_URL=http://localhost:4000
) > %FRONTEND_ENV_FILE%
echo Successfully wrote configuration to %FRONTEND_ENV_FILE%
echo.

echo --- Installation Complete! ---
echo.
echo Next Steps:
ECHO 1. Install dependencies for both frontend and backend:
ECHO    npm install --prefix backend
ECHO    npm install --prefix frontend
ECHO.
ECHO 2. Start the development servers:
ECHO    (In one terminal)
ECHO    npm run dev --prefix backend
ECHO.
ECHO    (In another terminal)
ECHO    npm run dev --prefix frontend
echo.

ENDLOCAL