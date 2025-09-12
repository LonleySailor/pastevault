import type { ExpiryOption } from '../types/paste';

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        // Fallback for older browsers
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const result = document.execCommand('copy');
            textArea.remove();
            return result;
        } catch (fallbackError) {
            return false;
        }
    }
}

/**
 * Generate paste URL
 */
export function generatePasteURL(id: string, baseURL?: string): string {
    const base = baseURL || window.location.origin;
    return `${base}/p/${id}`;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Just now';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

/**
 * Get time remaining until expiry
 */
export function getTimeRemaining(expiryString: string): string {
    const expiry = new Date(expiryString);
    const now = new Date();
    const diffInSeconds = Math.floor((expiry.getTime() - now.getTime()) / 1000);

    if (diffInSeconds <= 0) {
        return 'Expired';
    }

    if (diffInSeconds < 60) {
        return `${diffInSeconds} second${diffInSeconds > 1 ? 's' : ''} left`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} left`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} left`;
    } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} left`;
    }
}

/**
 * Validate paste content
 */
export function validatePasteContent(content: string): string[] {
    const errors: string[] = [];

    if (!content || content.trim().length === 0) {
        errors.push('Content cannot be empty');
    }

    if (content.length > 1048576) { // 1MB
        errors.push('Content is too large (maximum 1MB)');
    }

    return errors;
}

/**
 * Validate password
 */
export function validatePassword(password: string): string[] {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    return errors;
}

/**
 * Validate username
 */
export function validateUsername(username: string): string[] {
    const errors: string[] = [];

    if (!username || username.trim().length === 0) {
        errors.push('Username is required');
    }

    if (username.length < 3) {
        errors.push('Username must be at least 3 characters long');
    }

    if (username.length > 30) {
        errors.push('Username must be no more than 30 characters long');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        errors.push('Username can only contain letters, numbers, hyphens, and underscores');
    }

    return errors;
}

/**
 * Detect programming language from content
 */
export function detectLanguage(content: string, filename?: string): string {
    // Simple language detection based on content patterns
    const patterns = [
        { regex: /^\s*<\?php/i, language: 'php' },
        { regex: /^\s*#!/, language: 'bash' },
        { regex: /^\s*function\s+\w+\s*\(/i, language: 'javascript' },
        { regex: /^\s*def\s+\w+\s*\(/i, language: 'python' },
        { regex: /^\s*class\s+\w+/i, language: 'java' },
        { regex: /^\s*#include\s*</i, language: 'cpp' },
        { regex: /^\s*package\s+\w+/i, language: 'go' },
        { regex: /^\s*use\s+\w+/i, language: 'rust' },
        { regex: /^\s*<!DOCTYPE\s+html/i, language: 'html' },
        { regex: /^\s*{\s*"[\w$]+"\s*:/i, language: 'json' },
    ];

    for (const { regex, language } of patterns) {
        if (regex.test(content)) {
            return language;
        }
    }

    // Fallback to filename extension
    if (filename) {
        const ext = filename.split('.').pop()?.toLowerCase();
        const extMap: Record<string, string> = {
            js: 'javascript',
            ts: 'typescript',
            py: 'python',
            java: 'java',
            cpp: 'cpp',
            c: 'c',
            cs: 'csharp',
            php: 'php',
            rb: 'ruby',
            go: 'go',
            rs: 'rust',
            swift: 'swift',
            kt: 'kotlin',
            scala: 'scala',
            html: 'html',
            css: 'css',
            scss: 'scss',
            sass: 'sass',
            json: 'json',
            xml: 'xml',
            yml: 'yaml',
            yaml: 'yaml',
            toml: 'toml',
            md: 'markdown',
            sh: 'bash',
            sql: 'sql',
        };

        if (ext && extMap[ext]) {
            return extMap[ext];
        }
    }

    return 'plain';
}

/**
 * Get expiry duration in milliseconds
 */
export function getExpiryDuration(expiry: ExpiryOption): number | null {
    switch (expiry) {
        case '1h':
            return 60 * 60 * 1000;
        case '24h':
            return 24 * 60 * 60 * 1000;
        case '7d':
            return 7 * 24 * 60 * 60 * 1000;
        case 'never':
            return null;
        default:
            return 24 * 60 * 60 * 1000; // Default to 24h
    }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
