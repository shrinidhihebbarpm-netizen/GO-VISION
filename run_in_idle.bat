@echo off
title Go Vision - Launching in Python IDLE
echo ========================================================
echo   Launching Go Vision in Python IDLE...
echo ========================================================
echo.
python -m idlelib main.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo IDLE could not be launched via python -m idlelib.
    echo Running main.py directly:
    python main.py
)
pause
