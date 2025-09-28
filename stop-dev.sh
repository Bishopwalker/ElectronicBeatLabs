#!/bin/bash
echo "Stopping EBL development servers..."

echo "Checking for processes on port 5173 (frontend)..."
pids=$(netstat -ano | grep :5173 | awk '{print $5}' | sort -u)
for pid in $pids; do
    if [ ! -z "$pid" ]; then
        echo "Killing PID $pid"
        taskkill -F -PID $pid 2>/dev/null || true
    fi
done

echo "Checking for processes on port 8000 (backend)..."
pids=$(netstat -ano | grep :8000 | awk '{print $5}' | sort -u)
for pid in $pids; do
    if [ ! -z "$pid" ]; then
        echo "Killing PID $pid"
        taskkill -F -PID $pid 2>/dev/null || true
    fi
done

echo "Checking for Node.js processes..."
taskkill -F -IM node.exe 2>/dev/null || true

echo "Checking for Python processes..."
taskkill -F -IM python.exe 2>/dev/null || true

echo "All development servers stopped."