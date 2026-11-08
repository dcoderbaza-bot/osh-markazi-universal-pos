@echo off
title ASL OSH MARKAZI — Desktop POS & Silent Printer App
echo ====================================================================
echo   ASL OSH MARKAZI — Desktop POS Dasturi va Termal Printer Rejimi
echo   (--kiosk-printing orqali dialog oynasisiz avto-chek chiqarish)
echo ====================================================================

:: 1. Start Backend Server on Port 4000 if not already listening
netstat -ano | findstr :4000 >nul
if %errorlevel% neq 0 (
    echo [1/3] Backend API va Soliq OFD serveri ishga tushirilmoqda...
    start "AslOsh-Backend" /min cmd /c "cd /d %~dp0backend && node server.js"
) else (
    echo [1/3] Backend server allaqachon faol (Port 4000).
)

:: 2. Start Frontend Server on Port 5173 if not already listening
netstat -ano | findstr :5173 >nul
if %errorlevel% neq 0 (
    echo [2/3] Frontend POS interfeysi ishga tushirilmoqda...
    start "AslOsh-Frontend" /min cmd /c "cd /d %~dp0frontend && npm.cmd run dev"
    timeout /t 3 /nobreak >nul
) else (
    echo [2/3] Frontend server allaqachon faol (Port 5173).
)

:: 3. Launch Native Desktop Window with --kiosk-printing (Zero Print Dialog!)
echo [3/3] Desktop POS oynasi (--kiosk-printing) ochilmoqda...
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:5173 --kiosk-printing --start-maximized --user-data-dir="%~dp0.pos-desktop-profile"
    exit /b
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:5173 --kiosk-printing --start-maximized --user-data-dir="%~dp0.pos-desktop-profile"
    exit /b
)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=http://localhost:5173 --kiosk-printing --start-maximized --user-data-dir="%~dp0.pos-desktop-profile"
    exit /b
)

start http://localhost:5173
