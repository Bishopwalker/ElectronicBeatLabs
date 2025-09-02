# Electromagnetic Beat Lab - Multi-stage Docker Build

# ==========================================
# Build Stage - Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY yarn.lock ./

# Install all dependencies (including devDependencies for build)
RUN npm ci --no-audit

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./

# Build frontend
RUN npm run build

# ==========================================
# Build Stage - Backend
# ==========================================
FROM python:3.11-alpine AS backend-builder

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    libffi-dev \
    portaudio-dev \
    alsa-lib-dev

# Copy requirements and install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/

# ==========================================
# Production Stage
# ==========================================
FROM python:3.11-alpine AS production

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache \
    portaudio \
    alsa-lib \
    curl \
    && addgroup -g 1001 -S ebl \
    && adduser -S ebl -u 1001 -G ebl

# Copy Python dependencies from builder
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy backend application
COPY --from=backend-builder /app/backend ./backend
COPY --chown=ebl:ebl --from=backend-builder /app/backend ./backend

# Copy frontend build artifacts
COPY --from=frontend-builder /app/dist ./frontend/dist

# Create necessary directories
RUN mkdir -p /app/logs /app/data \
    && chown -R ebl:ebl /app

# Switch to non-root user
USER ebl

# Expose ports
EXPOSE 8000 5173

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Environment variables
ENV PYTHONPATH=/app/backend
ENV NODE_ENV=production
ENV PYTHON_ENV=production

# Labels for metadata
LABEL maintainer="bishop8-group"
LABEL version="1.0"
LABEL description="Electromagnetic Beat Lab - Binaural beats and EM field generation"

# Start command
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]