@echo off
title Universal Osh Markazi & Feed-Up POS Ekotizimi
echo ========================================================
echo   Universal Osh Markazi - Backend (4000) va Frontend (5173)
echo ========================================================
start "Osh Markazi Backend API" cmd /k "cd /d %~dp0backend && npm.cmd start"
start "Osh Markazi Frontend Web/POS" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"
echo Serverlar ishga tushirilmoqda:
echo - Backend API:  http://localhost:4000
echo - Frontend Sayt/POS: http://localhost:5173
pause
