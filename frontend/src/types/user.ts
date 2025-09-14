export interface User {
    id: number;
    username: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    password: string;  // Remove email as it's not in our backend
}

export interface TokenPair {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

export interface AuthResponse {
    user: User;
    tokens: TokenPair;
}
