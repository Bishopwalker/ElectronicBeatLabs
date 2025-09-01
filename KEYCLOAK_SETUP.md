# Keycloak Configuration for Electromagnetic Beat Lab

## Client Configuration

1. **Create a new client** in your Keycloak realm:
   - Client ID: `ebl-app`
   - Client Type: `OpenID Connect`
   - Client authentication: `Off` (for public client)

2. **Configure Client Settings**:
   - Valid redirect URIs: 
     - `http://localhost:5173/*`
     - `https://your-domain.com/*`
   - Valid post logout redirect URIs:
     - `http://localhost:5173`
     - `https://your-domain.com`
   - Web origins: 
     - `http://localhost:5173`
     - `https://your-domain.com`

3. **Client Scopes**:
   - Add `email` and `profile` to default client scopes
   - Ensure `openid` is included

## Realm Settings

1. **User Registration**: Enable if you want users to self-register
2. **Login Settings**:
   - User registration: Enable/Disable as needed
   - Forgot password: Enable
   - Remember me: Enable

## Environment Variables

Add these to your backend `.env` file:

```bash
KEYCLOAK_SERVER_URL=https://your-keycloak-server.com
KEYCLOAK_REALM=your-realm-name
KEYCLOAK_CLIENT_ID=ebl-app
KEYCLOAK_CLIENT_SECRET=your-client-secret-if-confidential
```

Add these to your frontend `.env` file:

```bash
REACT_APP_KEYCLOAK_URL=https://your-keycloak-server.com
REACT_APP_KEYCLOAK_REALM=your-realm-name
REACT_APP_KEYCLOAK_CLIENT_ID=ebl-app
```

## Features Implemented

### Timer System
- ✅ 2 free presets (Deep Sleep Starter, Focus Boost)
- ✅ Premium presets (Lucid Dream Protocol, etc.)
- ✅ Subscription-gated features with upgrade prompts
- ✅ Timed frequency transitions (theta → alpha/gamma)
- ✅ Custom timer creation (2 free, unlimited premium)
- ✅ Real-time session management
- ✅ Progress tracking and status display

### Authentication & Authorization
- ✅ Keycloak JWT token validation
- ✅ User creation from Keycloak tokens
- ✅ Subscription status integration with Stripe
- ✅ Protected routes and features

### Frontend Components
- ✅ TimerControls component with preset selection
- ✅ Real-time timer status display
- ✅ Frequency transition visualization
- ✅ Subscription upgrade prompts
- ✅ Tab navigation (Live Audio Generator / Timer Presets)

## API Endpoints

- `GET /api/timer/presets` - Get available timer presets
- `POST /api/timer/presets` - Create custom preset
- `POST /api/timer/start` - Start timer session
- `POST /api/timer/control` - Control timer (pause/resume/stop)
- `GET /api/timer/status` - Get session status
- `DELETE /api/timer/presets/{id}` - Delete custom preset
- `GET /api/timer/subscription-benefits` - Get subscription info

## Usage Example

Your exact use case is supported:
- 30 minutes in theta (3Hz, 100/103 Hz)
- Switch to gamma (40Hz) 
- 20 minutes later switch to beta
- Fully customizable patterns
- Subscription-gated for advanced features

The system automatically transitions between frequencies and provides visual feedback on current state and remaining time.