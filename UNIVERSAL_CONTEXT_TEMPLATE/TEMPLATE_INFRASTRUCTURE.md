# INFRASTRUCTURE.md - Universal Environment & Deployment Guide

## 🛠️ Development Environment Setup
**Adapt these sections based on your PROJECT_CONFIG.md**

### Prerequisites Checklist
- [ ] **Language Runtime** - Install version specified in PROJECT_CONFIG.md
- [ ] **Package Manager** - Install manager specified in PROJECT_CONFIG.md  
- [ ] **Database** - Install/configure database from PROJECT_CONFIG.md
- [ ] **Development Tools** - Install linters, formatters, etc.
- [ ] **Version Control** - Git configured with proper credentials
- [ ] **Editor/IDE** - Configured with project extensions/plugins

### Environment Variables
```bash
# Copy to .env file (create from PROJECT_CONFIG.md requirements)
# Database
DATABASE_URL=your_database_connection_string

# API Keys (never commit these!)
API_KEY=your_api_key
SECRET_KEY=your_secret_key

# Environment
NODE_ENV=development
DEBUG=true

# Ports (match PROJECT_CONFIG.md)
FRONTEND_PORT=3000
BACKEND_PORT=8000
```

### Local Development Commands
**From PROJECT_CONFIG.md - customize for your project:**
```bash
# Initial setup
npm install  # or pip install -r requirements.txt, etc.

# Database setup  
# Add your migration/setup commands

# Start development servers
npm run dev      # Frontend
npm run dev:api  # Backend
npm run dev:all  # Full stack

# Testing
npm test        # Run tests
npm run test:watch  # Watch mode

# Code quality
npm run lint    # Lint code
npm run format  # Format code
npm run type-check  # Type checking
```

---

## 🌐 Port Management
**Prevent conflicts across projects**

### Port Checking (Cross-Platform)
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8000

# Linux/Mac  
lsof -i :3000
lsof -i :8000
netstat -tulpn | grep :3000
```

### Process Management
```bash
# Kill processes by port
# Windows
for /f "tokens=5" %a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %a

# Linux/Mac
kill -9 $(lsof -t -i:3000)
```

### Port Assignment Strategy
- **Frontend**: 3000, 3001, 5173, 8080
- **Backend API**: 8000, 3001, 9000, 4000  
- **Database**: 5432 (PostgreSQL), 3306 (MySQL), 27017 (MongoDB)
- **Redis**: 6379
- **Development Tools**: 9229 (Node debug), 5555 (Prisma Studio)

---

## 🏗️ Build & Deployment

### Build Process
```bash
# Development build
npm run build:dev

# Production build  
npm run build

# Build verification
npm run build:verify  # Check build output

# Build analysis
npm run analyze      # Bundle analysis (if configured)
```

### Environment-Specific Configuration
```bash
# Development
export NODE_ENV=development
export DEBUG=true

# Staging
export NODE_ENV=staging  
export DEBUG=false

# Production
export NODE_ENV=production
export DEBUG=false
```

### Deployment Strategies
**Choose based on your platform from PROJECT_CONFIG.md:**

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Environment variables
vercel env add VARIABLE_NAME production
```

#### Railway Deployment  
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

#### AWS Deployment
```bash
# Using AWS CLI
aws configure
aws s3 sync ./dist s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

#### Docker Deployment
```dockerfile
# Add Dockerfile based on your language
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 💾 Database Management

### Local Database Setup
**PostgreSQL Example - adapt for your database:**
```bash
# Install PostgreSQL
# Windows: Download installer
# Mac: brew install postgresql  
# Linux: sudo apt install postgresql

# Create database
createdb your_project_name

# Connection string
DATABASE_URL="postgresql://username:password@localhost:5432/your_project_name"
```

### Database Migrations
**Adapt commands from PROJECT_CONFIG.md:**
```bash
# Create migration
# Prisma: npx prisma migrate dev --name init
# Django: python manage.py makemigrations  
# Alembic: alembic revision --autogenerate -m "init"

# Run migrations
# Prisma: npx prisma migrate deploy
# Django: python manage.py migrate
# Alembic: alembic upgrade head
```

### Database Seeding
```bash
# Add your seeding commands
# Prisma: npx prisma db seed
# Django: python manage.py loaddata fixture.json
# Custom: npm run db:seed
```

---

## 🔧 Troubleshooting Guide

### Common Issues

#### Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux

# Kill process
taskkill /f /pid PID          # Windows  
kill -9 PID                   # Mac/Linux
```

#### Database Connection Issues
```bash
# Check database status
# PostgreSQL: pg_ctl status
# MySQL: brew services list | grep mysql
# MongoDB: brew services list | grep mongodb

# Restart database
# PostgreSQL: brew services restart postgresql
# MySQL: brew services restart mysql
```

#### Environment Variables Not Loading
```bash
# Check .env file exists and is properly formatted
cat .env

# Verify environment loading in code
# Node.js: console.log(process.env.VARIABLE_NAME)  
# Python: print(os.getenv('VARIABLE_NAME'))
```

#### Package/Dependency Issues
```bash
# Clear cache and reinstall
# npm: rm -rf node_modules package-lock.json && npm install
# pip: pip cache purge && pip install -r requirements.txt
# go: go clean -modcache && go mod download
```

### Performance Issues
```bash
# Check resource usage
# CPU/Memory: htop (Linux/Mac), Task Manager (Windows)
# Disk: df -h (Linux/Mac), dir (Windows)  

# Profile application
# Node.js: node --inspect app.js
# Python: python -m cProfile script.py
```

### Network Issues  
```bash
# Test connectivity
curl -I http://localhost:3000
ping localhost

# Check firewall
# Windows: Windows Defender Firewall
# Mac: System Preferences > Security & Privacy > Firewall
# Linux: sudo ufw status
```

---

## 🚀 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: CI/CD
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build
```

### GitLab CI Example
```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - npm ci
    - npm run lint
    - npm test

build:
  stage: build  
  script:
    - npm run build
  artifacts:
    paths:
      - dist/
```

---

## 🔐 Security Configuration

### Environment Security
- **Never commit .env files** - Add to .gitignore
- **Use environment-specific secrets** - Different keys for dev/staging/prod
- **Rotate secrets regularly** - Update API keys periodically
- **Limit environment access** - Only necessary team members have production access

### HTTPS/SSL Setup
```bash
# Development HTTPS (mkcert)
mkcert -install
mkcert localhost 127.0.0.1

# Production - depends on hosting platform
# Vercel: Automatic HTTPS
# Railway: Automatic HTTPS  
# AWS: Use Certificate Manager
```

### API Security
- **Rate limiting** - Implement request limits
- **CORS configuration** - Properly configure allowed origins
- **Input validation** - Validate all user inputs
- **Authentication** - Implement proper auth flows

---

**🎯 Customize this infrastructure guide based on your specific PROJECT_CONFIG.md settings and deployment requirements.**