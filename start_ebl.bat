#!/bin/bash

# EBL Quick Start Script - Fix backend connection and audio issues
# Run this from your project directory: C:\Users\bisho\IdeaProjects\ebl

echo "🚀 Starting EBL with fixed configuration..."
echo "==========================================="

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found!"
    echo "Please run this script from the EBL project root directory"
    exit 1
fi

# Stop any existing containers
echo ""
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove any problematic containers
echo ""
echo "🧹 Cleaning up old containers..."
docker container prune -f

# Build backend with fresh configuration
echo ""
echo "🔨 Building backend with 48kHz sample rate..."
docker-compose build backend

# Start services
echo ""
echo "🎯 Starting services..."
docker-compose up -d

# Wait for backend to be healthy
echo ""
echo "⏳ Waiting for backend to be healthy..."
for i in {1..30}; do
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy!"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# Test WebSocket connection
echo ""
echo "🧪 Testing WebSocket connection..."
python3 -c "
import asyncio
import websockets
import json

async def test():
    try:
        uri = 'ws://localhost:8000/ws/audio/test-session'
        async with websockets.connect(uri, timeout=5) as ws:
            print('✅ WebSocket connection successful!')
            # Send test message
            await ws.send(json.dumps({'type': 'ping'}))
            return True
    except Exception as e:
        print(f'❌ WebSocket connection failed: {e}')
        return False

result = asyncio.run(test())
" 2>/dev/null || echo "⚠️  WebSocket test requires 'pip install websockets'"

# Show container status
echo ""
echo "📊 Container Status:"
docker-compose ps

# Show recent logs
echo ""
echo "📜 Recent Backend Logs:"
docker-compose logs --tail=10 backend | grep -E "(WebSocket|audio|Audio|connected|ERROR)"

echo ""
echo "============================================"
echo "✨ EBL should now be running!"
echo ""
echo "🌐 Frontend: http://localhost (or http://localhost:5173 for dev)"
echo "🔌 Backend API: http://localhost:8000"
echo "📡 WebSocket: ws://localhost:8000/ws/audio/{session_id}"
echo ""
echo "🎧 To test:"
echo "  1. Open http://localhost or http://localhost:5173"
echo "  2. Click on a pattern to start"
echo "  3. Check browser console for WebSocket connection status"
echo ""
echo "🔍 If still having issues, check:"
echo "  - docker-compose logs -f backend"
echo "  - Browser console (F12) for errors"
echo "============================================"
