import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import type {
    User,
    LoginRequest,
    RegisterRequest,
    AuthResponse
} from '../types/user';
import type { APIError } from '../types/api';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: APIError | null;
    login: (credentials: LoginRequest) => Promise<AuthResponse>;
    register: (userData: RegisterRequest) => Promise<AuthResponse>;
    logout: () => void;
    getProfile: () => Promise<User>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}
