import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import type { APIError } from '../types/api';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment
    ? 'http://localhost:8080/api'
    : 'https://privatepaste.lunatria.com/api';

// Create axios instance with base configuration
const api: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor with retry logic
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    async (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig & { retryCount?: number };

        // Check if we should retry the request
        if (config && !config.retryCount) {
            config.retryCount = 0;
        }

        if (config && config.retryCount !== undefined && config.retryCount < MAX_RETRIES) {
            config.retryCount += 1;

            // Delay before retry
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * config.retryCount!));

            // Retry the request
            return api(config);
        }

        // Handle common error scenarios
        if (error.response) {
            const apiError: APIError = {
                error: (error.response.data as any)?.error || 'An error occurred',
                code: (error.response.data as any)?.error || (error.response.data as any)?.code, // Use 'error' field as code since backend uses 'error' not 'code'
                details: error.response.data,
            };

            // Handle authentication errors
            if (error.response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }

            return Promise.reject(apiError);
        } else if (error.request) {
            // Network error
            const networkError: APIError = {
                error: 'Network error. Please check your connection.',
                code: 'network_error',
            };
            return Promise.reject(networkError);
        } else {
            // Request setup error
            const setupError: APIError = {
                error: 'Request failed to setup.',
                code: 'setup_error',
            };
            return Promise.reject(setupError);
        }
    }
);

export default api;
