import { createContext } from 'react';

export interface User {
  email: string;
  is_premium: boolean;
  oauth_provider: string;
  stripe_customer_id?: string;
  name?: string;
}

export interface UsageInfo {
  used_minutes: number;
  limit_minutes: number;
  remaining_minutes: number;
  can_use: boolean;
}

export interface AuthContextType {
  user: User | null;
  usage: UsageInfo | null;
  loading: boolean;
  requiresLogin: boolean;
  login: (provider: string, token: string) => Promise<void>;
  logout: () => void;
  recordUsage: (minutes: number) => Promise<void>;
  refreshUsage: () => Promise<void>;
  canUseApp: () => boolean;
  isSubscribed: boolean;
  keycloakReady: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);