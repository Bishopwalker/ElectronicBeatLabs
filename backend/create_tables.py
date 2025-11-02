#!/usr/bin/env python3
"""
Simple script to create database tables
"""

from backend.database.database import engine
from backend.database.models import Base

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)
    
    # Show what tables were created
    from sqlalchemy import inspect
    inspector = inspect(engine)
    tables = inspector.get_table_names()

if __name__ == "__main__":
    create_tables()