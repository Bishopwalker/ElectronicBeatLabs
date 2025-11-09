@echo off
echo Fixing your venv...

cd C:\Users\bisho\IdeaProjects\ebl\backend

echo Deleting old venv...
rmdir /s /q .venv

echo Creating fresh venv with Python 3.11...
C:\Users\bisho\AppData\Local\Programs\Python\Python311\python.exe -m venv .venv

echo Activating venv...
call .venv\Scripts\activate.bat

echo Python version:
python --version

echo Installing backend dependencies...
pip install fastapi uvicorn websockets numpy pydantic python-multipart

echo Installing RAG dependencies...
pip install sentence-transformers scikit-learn chromadb

echo Done! Your venv is ready!
echo Now run: .venv\Scripts\activate.bat
pause
