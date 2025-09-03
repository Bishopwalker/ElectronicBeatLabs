#!/usr/bin/env python3
"""
Fix relative imports in backend files to use absolute imports
"""
import os
import re

# Backend directory imports that need fixing
IMPORT_FIXES = {
    r'from database\.': 'from backend.database.',
    r'from auth\.': 'from backend.auth.',
    r'from services\.': 'from backend.services.',
    r'from schemas\.': 'from backend.schemas.',
    r'from utils\.': 'from backend.utils.',
    r'from routes\.': 'from backend.routes.',
    r'from core\.': 'from backend.core.',
    r'from modules\.': 'from backend.modules.',
    r'from protocols\.': 'from backend.protocols.',
}

def fix_imports_in_file(file_path):
    """Fix imports in a single file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    for old_pattern, new_prefix in IMPORT_FIXES.items():
        content = re.sub(old_pattern, new_prefix, content)
    
    if content != original:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed imports in {file_path}")
        return True
    return False

def main():
    backend_dir = "backend"
    if not os.path.exists(backend_dir):
        print("Backend directory not found")
        return
    
    fixed_count = 0
    for root, dirs, files in os.walk(backend_dir):
        for file in files:
            if file.endswith('.py'):
                file_path = os.path.join(root, file)
                if fix_imports_in_file(file_path):
                    fixed_count += 1
    
    print(f"Fixed imports in {fixed_count} files")

if __name__ == "__main__":
    main()