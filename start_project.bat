@echo off

:: Start the frontend
start cmd /c "cd frontend && npm run dev"

:: Start the backend
python backend\app.py
