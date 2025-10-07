# Electromagnetic Beat Lab - Docker Deployment Guide

Complete Docker containerization setup for production and development environments.

## =� Table of Contents

- [Quick Start](#quick-start)
- [Files Overview](#files-overview)
- [Production Deployment](#production-deployment)
- [Development Setup](#development-setup)
- [Environment Variables](#environment-variables)
- [AWS EC2 Deployment](#aws-ec2-deployment)

## =� Quick Start

### Development Mode (Hot-reload enabled)

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
nano .env

# Start development stack
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f app-dev

# Stop
docker-compose -f docker-compose.dev.yml down
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Production Mode

```bash
# Build production image
docker build -t ebl:latest .

# Start production stack
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

**Access:**
- Application: http://localhost:8000
- With Nginx: http://localhost (port 80)

## =� Files Overview

### Core Docker Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage production build |
| `Dockerfile.dev` | Development build with hot-reload |
| `.dockerignore` | Excludes files from build context |
| `docker-compose.yml` | Production orchestration |
| `docker-compose.dev.yml` | Development orchestration |
| `nginx.conf` | Nginx reverse proxy config |
| `.env.example` | Environment variables template |

### Architecture

```
Production (Dockerfile):
  Stage 1: Frontend Build (Node 20 Alpine)
  Stage 2: Backend Dependencies (Python 3.11 Slim)
  Stage 3: Production Runtime (Python 3.11 Slim)

Development (Dockerfile.dev):
  Single stage with hot-reload for both frontend + backend
```

## <� Production Deployment

### 1. Build Production Images

```bash
# Build backend
docker build -f Dockerfile.backend -t ebl-backend:latest .

# Build frontend
docker build -f Dockerfile.frontend -t ebl-frontend:latest .

# Or use docker-compose to build both
docker-compose build
```

### 2. Tag for Registry

```bash
# For Docker Hub
docker tag ebl-backend:latest yourusername/ebl-backend:latest
docker tag ebl-frontend:latest yourusername/ebl-frontend:latest

# For AWS ECR
docker tag ebl-backend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/ebl-backend:latest
docker tag ebl-frontend:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/ebl-frontend:latest

# For GitLab Registry
docker tag ebl-backend:latest registry.gitlab.com/bishop8-group/bbl-backend:latest
docker tag ebl-frontend:latest registry.gitlab.com/bishop8-group/bbl-frontend:latest
```

### 3. Push to Registry

```bash
# Docker Hub
docker push yourusername/ebl-backend:latest
docker push yourusername/ebl-frontend:latest

# AWS ECR (authenticate first)
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/ebl-backend:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/ebl-frontend:latest

# GitLab Registry
docker login registry.gitlab.com
docker push registry.gitlab.com/bishop8-group/bbl-backend:latest
docker push registry.gitlab.com/bishop8-group/bbl-frontend:latest
```

### 4. Deploy with Docker Compose

```bash
# Production stack (app + postgres + redis)
docker-compose up -d

# With Nginx reverse proxy
docker-compose --profile production up -d
```

## =� Development Setup

### Local Development with Docker

```bash
# Start dev environment
docker-compose -f docker-compose.dev.yml up

# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml up --build

# Run specific service
docker-compose -f docker-compose.dev.yml up app-dev

# Execute commands in container
docker-compose -f docker-compose.dev.yml exec app-dev npm run test
docker-compose -f docker-compose.dev.yml exec app-dev python -m pytest
```

### Hot-Reload Features

- **Frontend**: Vite dev server with HMR on port 5173
- **Backend**: Uvicorn with --reload on port 8000
- **Source mounting**: Changes reflect immediately

## = Environment Variables

### Required Variables

```bash
# Database
POSTGRES_DB=ebl_db
POSTGRES_USER=ebl_user
POSTGRES_PASSWORD=<secure-password>
DATABASE_URL=postgresql://ebl_user:<password>@postgres:5432/ebl_db

# Redis
REDIS_PASSWORD=<secure-password>
REDIS_URL=redis://default:<password>@redis:6379/0

# Security
SECRET_KEY=<generate-random-256-bit-key>
JWT_SECRET=<generate-random-256-bit-key>

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### Generate Secure Keys

```bash
# Generate SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate JWT_SECRET
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate passwords
openssl rand -base64 32
```

### Optional Variables

See `.env.example` for:
- Stripe payment integration
- AWS Cognito authentication
- Email SMTP configuration
- Logging settings
- Audio engine tuning

##  AWS EC2 Deployment

### EC2 Instance Setup

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker ubuntu
newgrp docker

# Clone repository
git clone https://gitlab.com/bishop8-group/bbl.git
cd bbl

# Setup environment
cp .env.example .env
nano .env  # Edit with production values

# Deploy
docker-compose up -d
```

### EC2 Security Group Rules

| Type | Port | Source | Description |
|------|------|--------|-------------|
| SSH | 22 | Your IP | Admin access |
| HTTP | 80 | 0.0.0.0/0 | Public web access |
| HTTPS | 443 | 0.0.0.0/0 | Secure web access |
| Custom | 8000 | 0.0.0.0/0 | API (if not using Nginx) |

### Nginx Production Setup

```bash
# Enable Nginx in docker-compose
docker-compose --profile production up -d

# Install SSL certificate (Let's Encrypt)
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Copy SSL certs to project
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/
sudo chown -R ubuntu:ubuntu ssl/

# Restart with SSL
docker-compose --profile production down
docker-compose --profile production up -d
```

## =' Maintenance Commands

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis

# Last 100 lines
docker-compose logs --tail=100 app
```

### Database Backups

```bash
# Backup
docker-compose exec postgres pg_dump -U ebl_user ebl_db > backup.sql

# Restore
docker-compose exec -T postgres psql -U ebl_user ebl_db < backup.sql
```

### Update Deployment

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Or rolling update (no downtime)
docker-compose up -d --build
```

### Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove volumes (DESTRUCTIVE - deletes data!)
docker-compose down -v

# Remove unused images
docker image prune -a

# Full cleanup
docker system prune -a --volumes
```

## =� Monitoring & Health Checks

### Built-in Health Checks

- **App**: `curl http://localhost:8000/health`
- **Postgres**: Automatic via Docker healthcheck
- **Redis**: Automatic via Docker healthcheck

### Container Status

```bash
# Check status
docker-compose ps

# Resource usage
docker stats

# Inspect container
docker-compose exec app env
docker-compose exec app df -h
docker-compose exec app free -m
```

## = Troubleshooting

### Build Fails

```bash
# Clear build cache
docker builder prune -a

# Build without cache
docker build --no-cache -t ebl:latest .
```

### Port Already in Use

```bash
# Find process using port
netstat -ano | findstr :8000
netstat -ano | findstr :5173

# Kill process (Windows)
taskkill /F /PID <process_id>

# Kill process (Linux)
sudo kill -9 <process_id>
```

### Database Connection Issues

```bash
# Check postgres logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U ebl_user -d ebl_db -c "SELECT 1"

# Reset database
docker-compose down -v
docker-compose up -d
```

### Permission Issues

```bash
# Fix ownership
sudo chown -R $USER:$USER .
chmod -R 755 .

# Inside container
docker-compose exec app chown -R ebl:ebl /app
```

## =� Performance Tuning

### Production Optimizations

1. **Multi-worker Uvicorn**: Already configured with 4 workers in `Dockerfile`
2. **Nginx caching**: Enabled in `nginx.conf`
3. **Gzip compression**: Enabled in `nginx.conf`
4. **Static asset caching**: 1-year expiry for immutable assets

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G
```

## = Security Best Practices

-  Non-root user in containers (user `ebl`, uid 1001)
-  Minimal base images (Alpine, Slim)
-  Multi-stage builds (no build tools in production)
-  Health checks for all services
-  Secret management via environment variables
-  SSL/TLS encryption
-  CORS configuration
-  Rate limiting in Nginx

## =� Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Docker Guide](https://fastapi.tiangolo.com/deployment/docker/)
- [Nginx Docker Guide](https://docs.nginx.com/nginx/admin-guide/installing-nginx/installing-nginx-docker/)
