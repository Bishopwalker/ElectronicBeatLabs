"""
Database base declaration for SQLAlchemy models

This module contains ONLY the Base declarative class to prevent circular imports.
All models should import Base from this module, not from database.py.
"""

from sqlalchemy.orm import declarative_base

# Create Base class for all database models
Base = declarative_base()
