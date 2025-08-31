// Backend API Hook
// Handles REST API communication with FastAPI backend

import { useState, useCallback } from 'react';

interface BackendState {
  loading: boolean;
  error: string | null;
  data: any;
}

interface APIResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export const useBackendAPI = (baseUrl: string = 'http://localhost:8000') => {
  const [state, setState] = useState<BackendState>({
    loading: false,
    error: null,
    data: null
  });

  const request = useCallback(async <T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<APIResponse<T>> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        const error = data.error || `HTTP ${response.status}`;
        setState(prev => ({ ...prev, loading: false, error }));
        return { error, status: response.status };
      }

      setState(prev => ({ ...prev, loading: false, data }));
      return { data, status: response.status };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { error: errorMessage, status: 0 };
    }
  }, [baseUrl]);

  // API methods
  const getPresets = useCallback(() => {
    return request('/api/presets');
  }, [request]);

  const getProtocols = useCallback(() => {
    return request('/api/protocols');
  }, [request]);

  const getSpatialOptions = useCallback(() => {
    return request('/api/spatial');
  }, [request]);

  const startSession = useCallback((settings: any) => {
    return request('/api/session/start', {
      method: 'POST',
      body: JSON.stringify(settings)
    });
  }, [request]);

  const stopSession = useCallback((sessionId: string) => {
    return request(`/api/session/${sessionId}/stop`, {
      method: 'POST'
    });
  }, [request]);

  const healthCheck = useCallback(() => {
    return request('/health');
  }, [request]);

  return {
    state,
    request,
    getPresets,
    getProtocols,
    getSpatialOptions,
    startSession,
    stopSession,
    healthCheck
  };
};