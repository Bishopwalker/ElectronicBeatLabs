# Multi-stage Dockerfile for FastAPI Backend
FROM python:3.11-slim as builder
# Set work directory
WORKDIR /app
# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends\
gcc \
g++ \
gfortran \
build-essential \
portaudio19-dev \
python3-dev \
libffi-dev \
libasound2-dev \
libopenblas-dev \
liblapack-dev \
pkg-config \
&& rm -rf /var/lib/apt/lists/*

# Create virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy requirements first for better caching
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim as production

# Set work directory
WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y -no-install-recommends \
portaudio19-dev \
libasound2 \
libportaudio2 \
libportaudiocpp0 \
libopenblas0 \
libgfortran5 \
curl \
ca-certificates \
&& rm -rf /var/lib/apt/lists/* \
&& apt-get clean

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Create app user
RUN groupadd -r ebl && useradd -r -g ebl -u 1001 ebl


# Copy Python packages AND shared libraries
COPY --from=builder /root/.local /home/ebl/.local
COPY --from=builder /usr/lib/x86_64-linux-gnu/libportaudio* /usr/lib/x86_64-linux-gnu/

# Copy backend application
COPY --chown=ebl:ebl backend/ ./backend/

# Create necessary directories
RUN mkdir -p /app/logs /app/data /app/uploads \
 && chown -R ebl:ebl /app

USER ebl

ENV PATH=/home/ebl/.local/bin:$PATH
ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1
ENV PYTHON_ENV=production


# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

LABEL maintainer="bishop8-group" \
version="1.0.0" \
description="EBL Backend - FastAPI + Python 3.11 with PyAudio"

# Use single worker for WebSocket compatibility
CMD ["python", "-m", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--ws-ping-interval", "20", "--ws-ping-timeout", "20"]