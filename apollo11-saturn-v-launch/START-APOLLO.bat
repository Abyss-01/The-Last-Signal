@echo off
setlocal
cd /d "%~dp0"
start "" /b cmd /c "timeout /t 2 /nobreak >nul ^& start http://localhost:8080"
python -m http.server 8080 --bind 127.0.0.1
if errorlevel 1 (
  echo.
  echo Could not start the server. Install Python or run: npx serve .
  pause
)
