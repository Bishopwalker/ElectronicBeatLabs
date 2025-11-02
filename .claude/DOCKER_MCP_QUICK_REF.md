# EBL Docker MCP Quick Reference

## 🎯 Common Docker Commands for EBL

### Check Status
```
"Show me all EBL containers"
"Are my EBL services running?"
"Check the health of ebl-backend"
```

### View Logs
```
"Show me the last 50 lines of ebl-backend logs"
"View ebl-frontend logs"
"Check logs for errors in the backend"
```

### Container Management
```
"Restart the ebl-backend container"
"Stop all EBL containers"
"Start the ebl-frontend container"
```

### Inspection & Debugging
```
"Inspect the ebl-backend container"
"Show resource usage for EBL containers"
"What ports are exposed on ebl-frontend?"
```

### Build & Deploy
```
"Build the backend Docker image"
"List all EBL-related images"
"Remove old EBL images"
```

### Execute Commands
```
"Run 'python --version' in ebl-backend"
"Check Python packages in backend container"
"Execute pip list in the backend"
```

## 📦 EBL Container Names

Based on your docker-compose.yml:
- **Backend**: `ebl-backend` or `ebl_backend_1`
- **Frontend**: `ebl-frontend` or `ebl_frontend_1`
- **Database**: (if using) `ebl-postgres` or `ebl_postgres_1`

## 🔧 Troubleshooting Commands

### Backend Issues
```
"Check if PyAudio is installed in ebl-backend"
"View environment variables in backend container"
"Check Python version in backend"
```

### Frontend Issues
```
"Check Node version in frontend container"
"View nginx configuration in frontend"
"Inspect frontend build artifacts"
```

### Network Issues
```
"List Docker networks"
"Show containers on ebl network"
"Check connectivity between containers"
```

## 🚀 Development Workflow

### Starting Development
1. "Start all EBL containers"
2. "Check logs for any startup errors"
3. "Verify both frontend and backend are healthy"

### Making Changes
1. Make your code changes
2. "Rebuild the backend image"
3. "Restart the backend container"
4. "Check logs for any errors"

### Debugging
1. "Show me backend logs with errors"
2. "Inspect backend container configuration"
3. "Execute pytest in the backend container"

### Cleanup
1. "Stop all EBL containers"
2. "Remove stopped EBL containers"
3. "Clean up unused EBL images"

## 💡 Pro Tips

- Always check logs after restarting containers
- Use `docker inspect` to verify configurations
- Monitor resource usage during development
- Keep container names consistent
- Tag images with version numbers

## 🎵 EBL-Specific Checks

### Audio Engine
```
"Check if portaudio is installed in backend"
"Verify PyAudio version in backend container"
"Test audio dependencies in backend"
```

### WebSocket
```
"Check if WebSocket port 8000 is exposed"
"View backend logs for WebSocket connections"
"Inspect backend WebSocket configuration"
```

### Frontend Build
```
"Check Vite version in frontend"
"Verify React build in frontend container"
"Inspect frontend nginx configuration"
```

## 📊 Quick Status Dashboard

Ask Claude:
```
"Give me a complete status report of all EBL services including:
- Container status (running/stopped)
- Resource usage (CPU/Memory)
- Log errors (last 10 entries)
- Network connectivity
- Image versions"
```