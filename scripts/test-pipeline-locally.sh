#!/bin/bash

echo "============================================"
echo "Testing GitLab CI/CD configuration locally..."
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0

# Test frontend
echo -e "\n${YELLOW}Testing frontend...${NC}"
if npm ci; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
    ((ERRORS++))
fi

if npm run test:ci; then
    echo -e "${GREEN}✓ Frontend tests passed${NC}"
else
    echo -e "${RED}✗ Frontend tests failed${NC}"
    ((ERRORS++))
fi

if npm run lint; then
    echo -e "${GREEN}✓ Frontend linting passed${NC}"
else
    echo -e "${RED}✗ Frontend linting failed${NC}"
    ((ERRORS++))
fi

if npm run build; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    ((ERRORS++))
fi

# Test backend
echo -e "\n${YELLOW}Testing backend...${NC}"
cd backend

# Create virtual environment
if python -m venv test_venv; then
    echo -e "${GREEN}✓ Python virtual environment created${NC}"
else
    echo -e "${RED}✗ Failed to create virtual environment${NC}"
    ((ERRORS++))
fi

# Activate virtual environment (Windows vs Unix)
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    source test_venv/Scripts/activate
else
    source test_venv/bin/activate
fi

# Install without PyAudio using CI requirements
if [ -f "requirements-ci.txt" ]; then
    echo "Using requirements-ci.txt (no PyAudio)"
    if pip install -r requirements-ci.txt; then
        echo -e "${GREEN}✓ Backend CI dependencies installed${NC}"
    else
        echo -e "${RED}✗ Failed to install backend CI dependencies${NC}"
        ((ERRORS++))
    fi
else
    echo "Creating requirements without PyAudio..."
    grep -v pyaudio requirements.txt > requirements-test.txt
    if pip install -r requirements-test.txt; then
        echo -e "${GREEN}✓ Backend dependencies installed (excluding PyAudio)${NC}"
    else
        echo -e "${RED}✗ Failed to install backend dependencies${NC}"
        ((ERRORS++))
    fi
    rm requirements-test.txt
fi

# Set up PyAudio mock
export PYTHONPATH="${PYTHONPATH}:${PWD}/mocks"

# Run tests
if python -m pytest; then
    echo -e "${GREEN}✓ Backend tests passed${NC}"
else
    echo -e "${RED}✗ Backend tests failed${NC}"
    ((ERRORS++))
fi

# Cleanup
deactivate
rm -rf test_venv

cd ..

# Summary
echo -e "\n============================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Local pipeline test complete - ALL TESTS PASSED!${NC}"
    echo "Your code is ready to push to GitLab."
else
    echo -e "${RED}✗ Local pipeline test complete - $ERRORS ERRORS FOUND${NC}"
    echo "Please fix the issues before pushing to GitLab."
fi
echo "============================================"

exit $ERRORS