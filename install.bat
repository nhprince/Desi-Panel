@echo off
SETLOCAL EnableDelayedExpansion

:: --- Helper Functions ---
:print_error
    echo.
    powershell.exe -Command "Write-Host('[ERROR] %~1', [System.ConsoleColor]::Red)"
    echo.
    goto :eof

:print_success
    echo.
    powershell.exe -Command "Write-Host('%~1', [System.ConsoleColor]::Green)"
    echo.
    goto :eof

:: --- ASCII Logo & Welcome ---
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
echo This script will configure, install, and set up your application.
echo.

:: --- Prerequisite Check ---
echo Checking prerequisites...
where npm >nul 2>nul || ( call :print_error "npm is not found. Please install Node.js and npm, then re-run the script." && exit /b )
where git >nul 2>nul || ( call :print_error "git is not found. Please install Git, then re-run the script." && exit /b )
echo Prerequisites met.
echo.


:: --- Configuration ---

:db_choice
echo --- Database Configuration ---
set /p USE_SQLITE="For easy local testing, do you want to use SQLite? (Y/n): "
if /i "%USE_SQLITE%"=="Y" goto :sqlite_setup
if /i "%USE_SQLITE%"=="" goto :sqlite_setup
if /i "%USE_SQLITE%"=="n" goto :postgres_setup
call :print_error "Invalid choice. Please enter 'Y' or 'n'."
goto :db_choice

:sqlite_setup
set DB_CONFIG_LINE=USE_SQLITE=1
goto :security_setup

:postgres_setup
:db_url_loop
set /p DATABASE_URL="Enter the PostgreSQL URL: "
if not defined DATABASE_URL ( call :print_error "Database URL cannot be empty." && goto :db_url_loop )
set DB_CONFIG_LINE=DATABASE_URL=!DATABASE_URL!

:security_setup
echo.
echo --- Security & Admin Credentials ---
:jwt_loop
set /p JWT_SECRET="Enter a strong JWT Secret (at least 16 characters): "
set str=!JWT_SECRET!
set /a len=0
:len_loop
if defined str (set str=!str:~1! && set /a len+=1 && goto :len_loop)
if !len! lss 16 ( call :print_error "JWT Secret must be at least 16 characters long." && goto :jwt_loop )

:email_loop
set /p ADMIN_EMAIL="Admin Email: "
if not defined ADMIN_EMAIL ( call :print_error "Email cannot be empty." && goto :email_loop )

:password_loop
echo (Note: Your password will be visible as you type.)
set /p ADMIN_PASSWORD="Admin Password (min 8 characters): "
set str=!ADMIN_PASSWORD!
set /a len=0
:len_loop_pass
if defined str (set str=!str:~1! && set /a len+=1 && goto :len_loop_pass)
if !len! lss 8 ( call :print_error "Password must be at least 8 characters long." && goto :password_loop )

:: --- Application Settings ---
echo.
echo --- Application Settings ---
set FRONTEND_ORIGIN_DEFAULT=http://localhost:5173
set FILES_ROOT_DEFAULT=%CD%\storage
set /p FRONTEND_ORIGIN="Frontend Origin URL [%FRONTEND_ORIGIN_DEFAULT%]: "
if not defined FRONTEND_ORIGIN set FRONTEND_ORIGIN=%FRONTEND_ORIGIN_DEFAULT%
set /p FILES_ROOT="Root directory for user files [%FILES_ROOT_DEFAULT%]: "
if not defined FILES_ROOT set FILES_ROOT=%FILES_ROOT_DEFAULT%

:: --- File Creation ---
echo.
echo Creating environment files...
if not exist backend mkdir backend
if not exist frontend mkdir frontend
(   echo # Backend Config > backend\.env
    echo PORT=4000 >> backend\.env
    echo NODE_ENV=development >> backend\.env
    echo. >> backend\.env
    echo # Database >> backend\.env
    echo !DB_CONFIG_LINE! >> backend\.env
    echo. >> backend\.env
    echo # Security >> backend\.env
    echo JWT_SECRET=!JWT_SECRET! >> backend\.env
    echo FRONTEND_ORIGIN=!FRONTEND_ORIGIN! >> backend\.env
    echo. >> backend\.env
    echo # Initial Admin User >> backend\.env
    echo ADMIN_EMAIL=!ADMIN_EMAIL! >> backend\.env
    echo ADMIN_PASSWORD=!ADMIN_PASSWORD! >> backend\.env
    echo. >> backend\.env
    echo # File System >> backend\.env
    echo FILES_ROOT=!FILES_ROOT! >> backend\.env
) && ( echo VITE_API_URL=http://localhost:4000 > frontend\.env ) && echo Environment files created successfully.
echo.

:: --- Installation ---
echo --- Installing Dependencies ---
echo This may take a few minutes...
echo.
echo [1/3] Installing backend dependencies...
call npm install --prefix backend --no-audit --fund false
if %errorlevel% neq 0 ( call :print_error "Failed to install backend dependencies." && exit /b )

echo [2/3] Installing frontend dependencies...
call npm install --prefix frontend --no-audit --fund false
if %errorlevel% neq 0 ( call :print_error "Failed to install frontend dependencies." && exit /b )

echo [3/3] Setting up database...
pushd backend
call npm run db:migrate
if %errorlevel% neq 0 ( popd && call :print_error "Failed to run database migrations. If using PostgreSQL, ensure the database server is running and accessible." && exit /b )
popd


:: --- Completion ---
call :print_success "--- Installation Complete! ---"

:start_choice
echo Your development environment is ready.
set /p START_NOW="Do you want to start the development servers now? (Y/n): "
if /i "%START_NOW%"=="n" goto :end
if /i "%START_NOW%"=="N" goto :end

echo.
echo Starting servers... Please close these new windows to stop the servers.
start "Desi Panel Backend" cmd /c "npm run dev --prefix backend"
start "Desi Panel Frontend" cmd /c "npm run dev --prefix frontend"

:end
call :print_success "Setup finished. You can start the servers manually at any time."
ENDLOCAL
