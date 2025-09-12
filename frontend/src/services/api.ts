import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import type { APIError } from '../types/api';

const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment
    ? 'http://localhost:8080/api'
    : 'https://api.pastevault.lunatria.com/api';

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
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error) => {
        // Handle common error scenarios
        if (error.response) {
            const apiError: APIError = {
                error: error.response.data?.error || 'An error occurred',
                code: error.response.data?.code,
                details: error.response.data,
            };

            // Handle authentication errors
            if (error.response.status === 401) {
                localStorage.removeItem('auth_token');
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
