// API Configuration
export const API_CONFIG = {
    MAX_PASTE_SIZE: 1048576, // 1MB
    DEFAULT_EXPIRY: '24h',
    SUPPORTED_LANGUAGES: [
        'javascript',
        'typescript',
        'python',
        'java',
        'cpp',
        'c',
        'csharp',
        'php',
        'ruby',
        'go',
        'rust',
        'swift',
        'kotlin',
        'scala',
        'html',
        'css',
        'scss',
        'sass',
        'json',
        'xml',
        'yaml',
        'toml',
        'markdown',
        'bash',
        'shell',
        'sql',
        'dockerfile',
        'nginx',
        'apache',
        'plain',
    ] as const,
} as const;

// Expiry options
export const EXPIRY_OPTIONS = [
    { value: '1h', label: '1 Hour' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: 'never', label: 'Never' },
] as const;

// Theme configuration
export const THEMES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
} as const;

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    PASTE_NOT_FOUND: 'Paste not found or has expired.',
    PASTE_EXPIRED: 'This paste has expired.',
    PASSWORD_REQUIRED: 'This paste is password protected.',
    INVALID_PASSWORD: 'Invalid password.',
    CONTENT_TOO_LARGE: 'Content is too large. Maximum size is 1MB.',
    INVALID_EXPIRY: 'Invalid expiry duration.',
    RATE_LIMITED: 'Too many requests. Please try again later.',
    VALIDATION_ERROR: 'Please fix the validation errors.',
    UNAUTHORIZED: 'You must be logged in to perform this action.',
    FORBIDDEN: 'You do not have permission to perform this action.',
    INTERNAL_ERROR: 'An internal error occurred. Please try again.',
} as const;
