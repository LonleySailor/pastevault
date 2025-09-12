import api from './api';
import type {
    User,
    LoginRequest,
    RegisterRequest,
    AuthResponse
} from '../types/user';

export class AuthService {
    /**
     * Register a new user
     */
    static async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    }

    /**
     * Login user
     */
    static async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', data);

        // Store token and user data
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        return response.data;
    }

    /**
     * Logout user
     */
    static logout(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    }

    /**
     * Get current user profile
     */
    static async getProfile(): Promise<User> {
        const response = await api.get<User>('/auth/profile');
        return response.data;
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
        const token = localStorage.getItem('auth_token');
        return !!token;
    }

    /**
     * Get current user from localStorage
     */
    static getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    /**
     * Get auth token
     */
    static getToken(): string | null {
        return localStorage.getItem('auth_token');
    }
}
