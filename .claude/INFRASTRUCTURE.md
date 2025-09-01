# EBL Infrastructure & Environment Reference

This document provides Claude with essential infrastructure context for the Electromagnetic Beat Lab project.

## 🏢 Project Context & Repository

**GitLab Repository:** `https://gitlab.com/bishop8-group/bbl.git`
- **Organization:** bishop8-group  
- **Project:** bbl (Electromagnetic Beat Lab)
- **Main Branch:** `main`
- **CI/CD:** GitLab CI with comprehensive pipeline (.gitlab-ci.yml)

## 🔐 Keycloak Authentication Infrastructure

**Production Keycloak Server:**
- **Status:** 24/7 running server for microservices
- **URL:** `http://localhost:8080` (development proxy)
- **Realm:** `ebl-realm` 
- **Client ID:** `ebl-app`
- **Integration:** JWT token validation with subscription status mapping

**Keycloak Configuration:**
```json
{
  "realm": "ebl-realm",
  "auth-server-url": "http://localhost:8080",
  "ssl-required": "external",
  "resource": "ebl-app",
  "public-client": true,
  "confidential-port": 0
}
```

**Available Files:**
- `keycloak-realm-config.json` - Complete realm configuration for import
- `.env.keycloak` - Environment variables for Keycloak integration
- `src/services/keycloak.ts` - Frontend Keycloak client integration

## 🐳 Docker Infrastructure

**Monitoring Stack:** `monitoring/docker-compose.yml`
- **Prometheus:** Port 9090 (metrics collection)
- **Grafana:** Port 3001 (dashboards)
- **AlertManager:** Port 9093 (alerts)
- **Node Exporter:** Port 9100 (system metrics)

**Development Environment:**
- **Frontend:** Vite dev server on port 5173
- **Backend:** FastAPI + Uvicorn on port 8000
- **Database:** SQLite for development, PostgreSQL for production

## 🌐 Microservices Architecture Context

**Project Role:**
- **Position:** Standalone audio/meditation service within larger microservices ecosystem
- **Authentication:** Integrated with existing Keycloak server
- **Payment:** Stripe integration for subscription management
- **Monitoring:** Prometheus metrics integration for centralized monitoring

**Service Communication:**
- **Frontend ↔ Backend:** REST API + WebSocket for real-time audio streaming
- **Authentication Flow:** Keycloak JWT tokens for user authentication
- **Subscription Status:** Stored in local database, synchronized with Stripe

## 💳 Payment & Subscription Infrastructure

**Stripe Integration:**
- **Environment:** Development keys in `.env.keycloak`
- **Products:** Monthly subscription for premium features
- **Pricing:** $3.99/month for unlimited access
- **Features:** 
  - Free: 2 timer presets, basic frequencies
  - Premium: 5+ presets, unlimited custom timers, advanced protocols

## 🔧 Development Environment Setup

**Required Services:**
1. **Keycloak Server** (if not using existing 24/7 server)
   ```bash
   docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:latest start-dev
   ```

2. **Backend Server**
   ```bash
   cd backend
   source .venv/bin/activate  # or venv_linux
   uvicorn main:app --reload --port 8000
   ```

3. **Frontend Server**
   ```bash
   npm run dev  # Vite on port 5173
   ```

## 🚀 Deployment Pipeline

**GitLab CI Stages:**
1. **Build:** TypeScript compilation, Python validation
2. **Test:** Unit tests, integration tests, E2E tests
3. **Artifacts:** `build.env` with deployment metadata
4. **Deploy:** Automated deployment (production configuration TBD)

**Required Environment Variables:**
```bash
# Keycloak
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=ebl-realm
KEYCLOAK_CLIENT_ID=ebl-app

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Database
DATABASE_URL=sqlite:///./ebl.db
```

## 📊 Monitoring & Observability

**Metrics Collection:**
- **Prometheus:** Custom metrics for audio engine, WebSocket connections, user sessions
- **Grafana:** Real-time dashboards for system performance and user analytics
- **Logging:** Structured logging with correlation IDs for request tracing

**Key Metrics:**
- Audio generation latency
- WebSocket connection stability
- User session duration
- Subscription conversion rates
- System resource utilization

## 🔍 Service Discovery & Health Checks

**Health Endpoints:**
- **Backend:** `GET /health` - System status, active sessions, resource usage
- **Audio Engine:** Embedded health checks for PyAudio and real-time audio generation
- **Database:** Connection health and query performance monitoring

## 🚨 Critical Infrastructure Notes

**For Claude AI Development:**
- **ALWAYS verify Keycloak server availability** before implementing auth features
- **Test timer endpoints with proper JWT tokens** from the existing Keycloak realm
- **Use the existing GitLab CI pipeline** - don't break the build
- **Integration with 24/7 Keycloak server** is preferred over local development instances
- **Subscription gating** is a core feature - test both free and premium user flows
- **Audio quality is paramount** - verify real-time audio streaming works properly

## 📁 Infrastructure File Locations

```
├── .env.keycloak                 # Keycloak environment variables
├── .gitlab-ci.yml               # CI/CD pipeline configuration
├── keycloak-realm-config.json   # Keycloak realm import configuration
├── monitoring/
│   └── docker-compose.yml       # Monitoring stack (Prometheus + Grafana)
├── src/services/keycloak.ts     # Frontend Keycloak integration
└── backend/.env.example         # Backend environment template
```

---

**Last Updated:** 2025-09-01
**Maintained By:** bishop8-group development team
**Contact:** Verify infrastructure changes through GitLab issues