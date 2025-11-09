#!/usr/bin/env python3
"""
Setup script for authentication and subscription system
"""

import os
import shutil
from pathlib import Path

def setup_environment():
    """Setup environment file"""
    env_example = Path("backend/.env.example")
    env_file = Path("backend/.env")
    
    if not env_file.exists() and env_example.exists():
        shutil.copy(env_example, env_file)
    else:

def install_dependencies():
    """Install backend dependencies"""
    os.system("cd backend && pip install -r requirements.txt")

def create_database():
    """Create database tables"""
    os.system("cd backend && python create_tables.py")

def run_tests():
    """Run basic tests"""
    os.system("cd backend && python test_simple_auth.py")

def main():
    
    setup_environment()
    
    install_dependencies()
    
    create_database()
    
    run_tests()

if __name__ == "__main__":
    main()