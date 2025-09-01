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
        print("📝 Creating .env file from template...")
        shutil.copy(env_example, env_file)
        print("✅ Created backend/.env - please update with your API keys")
    else:
        print("ℹ️ .env file already exists or template not found")

def install_dependencies():
    """Install backend dependencies"""
    print("📦 Installing backend dependencies...")
    os.system("cd backend && pip install -r requirements.txt")

def create_database():
    """Create database tables"""
    print("🗄️ Creating database tables...")
    os.system("cd backend && python create_tables.py")

def run_tests():
    """Run basic tests"""
    print("🧪 Running authentication tests...")
    os.system("cd backend && python test_simple_auth.py")

def main():
    print("🚀 Setting up Electromagnetic Beat Lab authentication system...\n")
    
    setup_environment()
    print()
    
    install_dependencies()
    print()
    
    create_database()
    print()
    
    run_tests()
    print()
    
    print("✨ Setup complete!")
    print("\nNext steps:")
    print("1. Update backend/.env with your API keys:")
    print("   - STRIPE_SECRET_KEY")
    print("   - STRIPE_PUBLISHABLE_KEY")
    print("   - GOOGLE_CLIENT_ID (for OAuth)")
    print("   - GITHUB_CLIENT_ID (for OAuth)")
    print()
    print("2. Start the backend:")
    print("   cd backend && uvicorn main:app --reload --port 8000")
    print()
    print("3. Start the frontend:")
    print("   npm run dev")
    print()
    print("4. Visit http://localhost:5173 to test the authentication!")

if __name__ == "__main__":
    main()