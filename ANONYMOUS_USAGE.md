# Anonymous Usage System

## 🎯 Overview

The Electromagnetic Beat Lab now supports **anonymous usage** with seamless upgrade paths:

1. **Anonymous users** get 3 hours free per month (tracked by IP address)
2. **Login only required** when free limit is exhausted  
3. **Premium subscription** ($3.99/month) provides unlimited usage
4. **Smooth upgrade path** from anonymous → login → premium

## 🔄 User Flow

### Anonymous Usage (Default)
```
User visits app → Can use immediately → Usage tracked by IP → 3 hours free/month
```

### When Free Limit Exhausted
```
IP reaches 3 hours → Login required screen appears → User can:
  1. Login with OAuth (Google/GitHub) for fresh 3-hour limit
  2. Subscribe to Premium for unlimited usage
```

### After Login
```
Logged in user → Gets separate 3-hour limit → Can upgrade to Premium anytime
```

## 🛠️ Technical Implementation

### Backend Changes
- **Database**: Usage tracked by `ip_address` first, `user_email` after login
- **API Routes**: 
  - `/api/usage/check` - Check anonymous usage by IP
  - `/api/usage/anonymous` - Record anonymous usage  
  - `/api/usage/user` - Record logged-in user usage
- **Smart tracking**: Automatically uses IP from request headers

### Frontend Changes
- **AuthContext**: Handles both anonymous and authenticated states
- **App.tsx**: Shows usage indicators, login only when needed
- **Usage Hook**: `useUsageTracking()` for automatic session tracking

### Example Usage Tracking
```typescript
import { useUsageTracking } from './hooks/useUsageTracking';

const MyComponent = () => {
  const { startSession, endSession } = useUsageTracking();
  
  // Start tracking when user begins listening
  const handleStartListening = () => {
    startSession();
    // ... start binaural beats
  };
  
  // End tracking when user stops
  const handleStopListening = () => {
    endSession();
    // ... stop binaural beats
  };
};
```

## 🚀 Getting Started

1. **Setup backend**:
   ```bash
   cd backend
   python create_tables.py  # Creates new IP-based usage tables
   uvicorn main:app --reload
   ```

2. **Start frontend**:
   ```bash
   npm run dev
   ```

3. **Test the flow**:
   - Visit http://localhost:5173
   - App loads immediately (anonymous usage)
   - Use "Usage Tracking Demo" in top-left to simulate sessions
   - Watch usage counter in top-right  
   - After 3 hours, login screen appears

## 📊 Usage Tracking Features

- **Automatic recording** every 5 minutes during active sessions
- **IP-based anonymous tracking** - no cookies needed
- **Seamless login upgrade** - maintains usage history
- **Real-time usage display** - shows remaining minutes
- **Premium bypass** - unlimited usage for subscribers

## 🔧 Configuration

Update `backend/.env` with your OAuth keys:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GITHUB_CLIENT_ID=your_github_client_id
STRIPE_SECRET_KEY=your_stripe_key
```

## 🧪 Testing

Run the backend tests:
```bash
cd backend
python test_simple_auth.py
```

Tests cover:
- ✅ Anonymous IP-based usage tracking
- ✅ Usage limit enforcement  
- ✅ Login requirement after limit
- ✅ User-based tracking after login
- ✅ Premium subscription bypass

---

**Perfect for low-cost subscription services!** 
- No upfront barriers
- Natural upgrade prompts
- Minimal data collection
- Clean user experience