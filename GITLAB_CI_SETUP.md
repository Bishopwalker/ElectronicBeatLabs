# 🚀 GitLab CI/CD Security Setup Guide

## 📋 Required GitLab CI/CD Variables

To enable all security features, you need to configure these variables in GitLab:

**Go to**: Project Settings → CI/CD → Variables

### 🔒 **Required Variables**

```bash
# SonarQube Integration
SONAR_HOST_URL=https://sonarqube.your-domain.com
SONAR_TOKEN=your-sonar-project-token

# Snyk Security Scanning  
SNYK_TOKEN=your-snyk-auth-token

# Security Notifications
SECURITY_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK

# Container Registry (GitLab provides these automatically)
CI_REGISTRY_USER=gitlab-ci-token
CI_REGISTRY_PASSWORD=<access-token>
```

### 🏗️ **Optional Variables**

```bash
# DataDog Monitoring (if using)
DATADOG_API_KEY=your-datadog-api-key
DATADOG_APP_KEY=your-datadog-app-key

# Sentry Monitoring (if using) 
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-sentry-organization
SENTRY_PROJECT=electromagnetic-beat-lab

# Additional Security Tools
RAPID7_API_KEY=your-rapid7-api-key
AQUA_SERVER=your-aqua-server-url
AQUA_USERNAME=your-aqua-username
AQUA_PASSWORD=your-aqua-password
```

## 🛠️ **Setup Instructions**

### 1. **SonarQube Setup**

#### Option A: SonarQube Cloud (Recommended)
```bash
# 1. Go to https://sonarcloud.io/
# 2. Sign in with GitLab
# 3. Create new project: "electromagnetic-beat-lab"
# 4. Get project token from Project Settings → Analysis Method → Manually

SONAR_HOST_URL=https://sonarcloud.io
SONAR_TOKEN=your-generated-token
```

#### Option B: Self-hosted SonarQube
```bash
# 1. Deploy SonarQube server (Docker recommended)
docker run -d --name sonarqube -p 9000:9000 sonarqube:community

# 2. Access http://your-domain:9000
# 3. Create project and generate token

SONAR_HOST_URL=https://your-sonarqube-server.com
SONAR_TOKEN=your-generated-token
```

### 2. **Snyk Security Setup**

```bash
# 1. Go to https://snyk.io/
# 2. Sign up/Login with GitLab
# 3. Go to Settings → General → Auth Token
# 4. Generate new token

SNYK_TOKEN=your-snyk-token
```

### 3. **Slack Webhook Setup**

```bash
# 1. Go to your Slack workspace
# 2. Create new app: https://api.slack.com/apps
# 3. Enable Incoming Webhooks
# 4. Create webhook for your channel

SECURITY_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX
```

## 🔧 **Local Development Security Setup**

Create a `.env` file for local testing:

```bash
# .env (DO NOT commit this file)
SONAR_HOST_URL=https://sonarcloud.io
SONAR_TOKEN=your-local-testing-token
SNYK_TOKEN=your-snyk-token
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## 🎯 **Quick Test Commands**

```bash
# Test all security tools locally
npm run security:all

# Individual security scans
npm run security:audit          # npm audit
npm run security:eslint         # ESLint security rules
npm run security:bandit         # Python Bandit scan
npm run security:safety         # Python Safety scan
npm run security:snyk           # Snyk vulnerability scan

# TypeScript compilation check
npm run type-check

# Run all tests with coverage
npm run test:coverage
```

## 📊 **GitLab CI/CD Pipeline Stages**

1. **🔍 Security Scan** - SAST, Secret Detection, Semgrep
2. **📦 Dependency Check** - npm audit, Snyk, Safety, Bandit
3. **🏗️ Quality Analysis** - SonarQube, ESLint Security
4. **🧪 Test** - Unit tests with coverage, E2E security tests
5. **🔒 Security Audit** - Container scanning, License compliance, OWASP ZAP
6. **🏗️ Build** - TypeScript build, Docker build with security scanning
7. **🚀 Deploy** - Staging/Production deployment

## 🚨 **Security Alerts Configuration**

The pipeline will automatically:

- ⛔ **Block deployments** if critical vulnerabilities found
- 📧 **Send alerts** to Slack when security issues detected
- 📊 **Generate reports** with security metrics
- 🔄 **Update dashboards** with security status

## 🔧 **Pipeline Customization**

Edit `.gitlab-ci.yml` to customize:

```yaml
variables:
  # Adjust security thresholds
  SECURITY_SEVERITY_THRESHOLD: "high"  # block on high+ vulnerabilities
  MAX_CRITICAL_VULNERABILITIES: 0      # allow 0 critical vulnerabilities
  MAX_HIGH_VULNERABILITIES: 5          # allow max 5 high vulnerabilities
  
  # Enable/disable specific scans
  ENABLE_SAST: "true"
  ENABLE_DEPENDENCY_SCANNING: "true"
  ENABLE_CONTAINER_SCANNING: "true"
  ENABLE_OWASP_ZAP: "true"
```

## 🛡️ **Security Quality Gates**

Pipeline will fail if:
- ❌ Critical vulnerabilities found
- ❌ High-severity vulnerabilities exceed threshold
- ❌ Secrets detected in code
- ❌ Security test coverage below 80%
- ❌ SonarQube quality gate fails

## 📈 **Security Metrics Dashboard**

After setup, you'll have access to:

- 📊 **Vulnerability trends** over time
- 🎯 **Security coverage** metrics
- 🔄 **Dependency update** status
- 📋 **Compliance reports** (OWASP, NIST, etc.)
- 🚨 **Real-time alerts** for security events

## 🔗 **Integration URLs**

After configuration, access your dashboards:

```bash
# SonarQube Quality Dashboard
https://sonarcloud.io/project/overview?id=electromagnetic-beat-lab

# Snyk Vulnerability Dashboard  
https://app.snyk.io/org/your-org/projects

# GitLab Security Dashboard
https://gitlab.com/your-group/electromagnetic-beat-lab/-/security/dashboard
```

## 🆘 **Troubleshooting**

### Common Issues:

1. **SonarQube Token Invalid**
   ```bash
   # Regenerate token in SonarQube settings
   # Update SONAR_TOKEN variable in GitLab
   ```

2. **Snyk Rate Limiting**
   ```bash
   # Upgrade to Snyk paid plan or reduce scan frequency
   ```

3. **Pipeline Timeout**
   ```bash
   # Increase timeout in .gitlab-ci.yml:
   timeout: 2h
   ```

4. **False Positives**
   ```bash
   # Add exclusions to sonar-project.properties
   # Update security tool configurations
   ```

---

**Next Steps:**
1. ✅ Configure GitLab CI/CD variables above
2. ✅ Push code to trigger first security pipeline
3. ✅ Review security reports and fix any issues
4. ✅ Set up monitoring dashboards
5. ✅ Train team on security workflow

**Support:** Create issue in GitLab for questions  
**Documentation:** See SECURITY.md for detailed security policies