import { useState, useCallback, useEffect } from 'react';
import { AuthService } from '../services/authService';
import type {
    User,
    LoginRequest,
    RegisterRequest,
    AuthResponse
} from '../types/user';
import type { APIError } from '../types/api';

interface UseAuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: APIError | null;
}

/**
 * Hook for managing authentication
 */
export function useAuth() {
    const [state, setState] = useState<UseAuthState>({
        user: null,
        isAuthenticated: false,
        loading: true, // Start with loading to check existing auth
        error: null,
    });

    // Check for existing authentication on mount
    useEffect(() => {
        const checkAuth = () => {
            const isAuthenticated = AuthService.isAuthenticated();
            const user = AuthService.getCurrentUser();

            setState(prev => ({
                ...prev,
                user,
                isAuthenticated,
                loading: false,
            }));
        };

        checkAuth();
    }, []);

    const login = useCallback(async (credentials: LoginRequest) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response: AuthResponse = await AuthService.login(credentials);
            setState(prev => ({
                ...prev,
                user: response.user,
                isAuthenticated: true,
                loading: false,
            }));
            return response;
        } catch (error) {
            const apiError = error as APIError;
            setState(prev => ({
                ...prev,
                error: apiError,
                loading: false,
                isAuthenticated: false,
                user: null,
            }));
            throw error;
        }
    }, []);

    const register = useCallback(async (userData: RegisterRequest) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response: AuthResponse = await AuthService.register(userData);
            setState(prev => ({
                ...prev,
                user: response.user,
                isAuthenticated: true,
                loading: false,
            }));
            return response;
        } catch (error) {
            const apiError = error as APIError;
            setState(prev => ({
                ...prev,
                error: apiError,
                loading: false,
                isAuthenticated: false,
                user: null,
            }));
            throw error;
        }
    }, []);

    const logout = useCallback(() => {
        AuthService.logout();
        setState({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
        });
    }, []);

    const getProfile = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const user = await AuthService.getProfile();
            setState(prev => ({
                ...prev,
                user,
                loading: false,
            }));
            return user;
        } catch (error) {
            const apiError = error as APIError;
            setState(prev => ({
                ...prev,
                error: apiError,
                loading: false,
            }));

            // If profile fetch fails, likely token is invalid
            if (apiError.code === 'unauthorized') {
                logout();
            }

            throw error;
        }
    }, [logout]);

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        ...state,
        login,
        register,
        logout,
        getProfile,
        clearError,
    };
}
