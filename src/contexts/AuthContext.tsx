import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  email: string;
  is_premium: boolean;
  oauth_provider: string;
  stripe_customer_id?: string;
}

interface UsageInfo {
  used_minutes: number;
  limit_minutes: number;
  remaining_minutes: number;
  can_use: boolean;
}

interface AuthContextType {
  user: User | null;
  usage: UsageInfo | null;
  loading: boolean;
  requiresLogin: boolean;
  login: (provider: string, token: string) => Promise<void>;
  logout: () => void;
  recordUsage: (minutes: number) => Promise<void>;
  refreshUsage: () => Promise<void>;
  canUseApp: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [requiresLogin, setRequiresLogin] = useState(false);

  // Check for saved user and load anonymous usage on app start
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('ebl_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          await refreshUsageForUser(userData.email);
        } catch (err) {
          console.error('Failed to load saved user:', err);
          localStorage.removeItem('ebl_user');
        }
      } else {
        // Load anonymous usage for this IP
        await refreshAnonymousUsage();
      }
    };
    
    initializeAuth();
  }, []);

  const login = async (provider: string, token: string) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, provider })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('ebl_user', JSON.stringify(userData));
      
      // Load usage info for free users
      if (!userData.is_premium) {
        await refreshUsageForUser(userData.email);
      }
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setUsage(null);
    localStorage.removeItem('ebl_user');
  };

  const refreshAnonymousUsage = async () => {
    try {
      const response = await fetch('/api/usage/check');
      if (response.ok) {
        const usageData = await response.json();
        setUsage(usageData);
        setRequiresLogin(usageData.requires_login || false);
      }
    } catch (error) {
      console.error('Failed to refresh anonymous usage:', error);
    }
  };

  const refreshUsageForUser = async (email: string) => {
    try {
      const response = await fetch(`/api/usage/${email}`);
      if (response.ok) {
        const usageData = await response.json();
        setUsage(usageData);
        setRequiresLogin(false); // Already logged in
      }
    } catch (error) {
      console.error('Failed to refresh user usage:', error);
    }
  };

  const refreshUsage = async () => {
    if (user) {
      await refreshUsageForUser(user.email);
    } else {
      await refreshAnonymousUsage();
    }
  };

  const recordUsage = async (minutes: number) => {
    try {
      if (user) {
        // Record for logged in user
        const response = await fetch('/api/usage/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, minutes })
        });
        if (response.ok) {
          await refreshUsageForUser(user.email);
        }
      } else {
        // Record anonymous usage
        const response = await fetch('/api/usage/anonymous', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ minutes })
        });
        if (response.ok) {
          await refreshAnonymousUsage();
        }
      }
    } catch (error) {
      console.error('Failed to record usage:', error);
      throw error;
    }
  };

  const canUseApp = (): boolean => {
    // Premium users can always use
    if (user && user.is_premium) return true;
    
    // If no usage data yet, allow usage while loading
    if (!usage) return true;
    
    // Check if can use based on limits
    return usage.can_use;
  };

  const value: AuthContextType = {
    user,
    usage,
    loading,
    requiresLogin,
    login,
    logout,
    recordUsage,
    refreshUsage,
    canUseApp
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;