import api from './api';
import type {
    User,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    TokenPair
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

        // Store tokens and user data
        localStorage.setItem('access_token', response.data.tokens.access_token);
        localStorage.setItem('refresh_token', response.data.tokens.refresh_token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        return response.data;
    }

    /**
     * Logout user
     */
    static logout(): void {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    }

    /**
     * Get current user profile
     */
    static async getProfile(): Promise<User> {
        const response = await api.get<User>('/user/profile');  // Correct endpoint
        return response.data;
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
        const token = localStorage.getItem('access_token');
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
        return localStorage.getItem('access_token');
    }

    /**
     * Get refresh token
     */
    static getRefreshToken(): string | null {
        return localStorage.getItem('refresh_token');
    }

    /**
     * Refresh access token
     */
    static async refreshToken(): Promise<TokenPair | null> {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) return null;

        try {
            const response = await api.post<TokenPair>('/auth/refresh', {
                refresh_token: refreshToken
            });

            // Update stored tokens
            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);

            return response.data;
        } catch (error) {
            // If refresh fails, user needs to login again
            this.logout();
            return null;
        }
    }
}
