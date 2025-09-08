#!/bin/bash
# Security Vulnerability Fix Script for Electromagnetic Beat Lab
# Addresses vulnerabilities found in security scans

echo "🔒 Starting security vulnerability remediation..."

# Update pip first
echo "📦 Updating pip..."
cd backend && python -m pip install --upgrade pip

# Fix Python vulnerabilities
echo "🐍 Fixing Python vulnerabilities..."

# Update starlette (CVE-2023-5752)
python -m pip install --upgrade starlette>=0.32.0

# Update python-jose (multiple CVEs)
python -m pip install --upgrade python-jose>=3.3.1

# Update ecdsa (multiple CVEs) 
python -m pip install --upgrade ecdsa>=0.19.2

# Return to root directory
cd ..

# Fix npm vulnerabilities (if any)
echo "📦 Checking for npm vulnerabilities..."
npm audit fix

# Update security-related packages
echo "🛡️ Updating security dependencies..."
npm update eslint-plugin-security snyk audit-ci

# Run type check to ensure everything still works
echo "🔍 Running type check..."
npm run type-check

# Run security audit to verify fixes
echo "🔒 Verifying security fixes..."
npm run security:audit

# Run Python security check again
echo "🐍 Verifying Python security fixes..."
cd backend && python -m safety check

echo "✅ Security vulnerability remediation completed!"
echo "📊 Review the security reports above to confirm all issues are resolved."

# Generate security summary
echo ""
echo "🛡️ Security Status Summary:"
echo "=========================="
echo "✅ npm audit: $(npm audit --audit-level moderate 2>/dev/null | grep -c 'found 0 vulnerabilities' || echo 'Issues found')"
echo "🐍 Python Safety: $(cd backend && python -m safety check --json 2>/dev/null | jq -r '.vulnerabilities_found // "unknown"') vulnerabilities found"
echo "📋 License compliance: $(npm run security:license 2>/dev/null | grep -c 'MIT\|Apache\|BSD' || echo 'unknown') compliant licenses"
echo ""
echo "🔗 Next steps:"
echo "1. Review security reports above"  
echo "2. Configure GitLab CI/CD variables (see GITLAB_CI_SETUP.md)"
echo "3. Push changes to trigger security pipeline"
echo "4. Monitor security dashboards"