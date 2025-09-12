import React from 'react'
import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '../context/ThemeContext'
import { AuthProvider } from '../context/AuthContext'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return (
        <BrowserRouter>
            <ThemeProvider>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </ThemeProvider>
            <Toaster position="top-right" />
        </BrowserRouter>
    )
}

const customRender = (
    ui: ReactElement,
    options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from testing library
export * from '@testing-library/react'
export { customRender as render }

// Mock data helpers
export const mockPaste = {
    id: 'abc123',
    title: 'Test Paste',
    content: 'console.log("Hello, World!");',
    language: 'javascript',
    isPublic: true,
    hasPassword: false,
    expiresAt: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    views: 0,
}

export const mockUser = {
    id: 1,
    username: 'testuser',
}

export const mockAuthResponse = {
    user: mockUser,
    token: 'mock-jwt-token',
}

// Mock API responses
export function mockApiResponse<T>(data: T) {
    return {
        ok: true,
        status: 200,
        json: async () => data,
    }
}

export function mockApiError(status: number, message: string) {
    return {
        ok: false,
        status,
        json: async () => ({ error: message }),
    }
}
