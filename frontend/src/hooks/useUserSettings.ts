import { useState, useCallback } from 'react';
import { api } from '../services/api';
import type { APIError } from '../types/api';

interface UserSettings {
  defaultExpiry: string;
  defaultLanguage: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  publicPastesByDefault: boolean;
}

interface UseUserSettingsState {
  settings: UserSettings | null;
  loading: boolean;
  error: APIError | null;
}

export function useUserSettings() {
  const [state, setState] = useState<UseUserSettingsState>({
    settings: null,
    loading: false,
    error: null,
  });

  const fetchSettings = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await api.get<UserSettings>('/user/settings');
      setState(prev => ({ ...prev, settings: response.data, loading: false }));
      return response.data;
    } catch (error) {
      const apiError = error as APIError;
      setState(prev => ({ ...prev, error: apiError, loading: false }));
      throw error;
    }
  }, []);

  const updateSettings = useCallback(async (settings: Partial<UserSettings>) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await api.patch<UserSettings>('/user/settings', settings);
      setState(prev => ({ ...prev, settings: response.data, loading: false }));
      return response.data;
    } catch (error) {
      const apiError = error as APIError;
      setState(prev => ({ ...prev, error: apiError, loading: false }));
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    fetchSettings,
    updateSettings,
    clearError,
  };
}
