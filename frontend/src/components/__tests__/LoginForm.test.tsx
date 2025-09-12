import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '../../test/utils'
import { LoginForm } from '../auth/LoginForm'

describe('LoginForm Component', () => {
    const mockOnSubmit = vi.fn()

    beforeEach(() => {
        mockOnSubmit.mockClear()
    })

    it('renders login form with all required fields', () => {
        render(<LoginForm onSubmit={mockOnSubmit} />)

        expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
        expect(screen.getByLabelText('Username')).toBeInTheDocument()
        expect(screen.getByLabelText('Password')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('shows password visibility toggle', () => {
        render(<LoginForm onSubmit={mockOnSubmit} />)

        const passwordInput = screen.getByLabelText('Password')
        const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button

        expect(passwordInput).toHaveAttribute('type', 'password')

        fireEvent.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'text')

        fireEvent.click(toggleButton)
        expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('calls onSubmit with correct credentials when form is submitted', () => {
        render(<LoginForm onSubmit={mockOnSubmit} />)

        const usernameInput = screen.getByLabelText('Username')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: /sign in/i })

        fireEvent.change(usernameInput, { target: { value: 'testuser' } })
        fireEvent.change(passwordInput, { target: { value: 'password123' } })
        fireEvent.click(submitButton)

        expect(mockOnSubmit).toHaveBeenCalledWith('testuser', 'password123')
    })

    it('does not submit form with empty fields', () => {
        render(<LoginForm onSubmit={mockOnSubmit} />)

        const submitButton = screen.getByRole('button', { name: /sign in/i })

        expect(submitButton).toBeDisabled()

        fireEvent.click(submitButton)
        expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('displays error message when provided', () => {
        const errorMessage = 'Invalid credentials'
        render(<LoginForm onSubmit={mockOnSubmit} error={errorMessage} />)

        expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })

    it('shows loading state when loading prop is true', () => {
        render(<LoginForm onSubmit={mockOnSubmit} loading={true} />)

        const submitButton = screen.getByRole('button', { name: /signing in.../i })
        expect(submitButton).toBeDisabled()
        expect(screen.getByText('Signing in...')).toBeInTheDocument()
    })

    it('disables form fields when loading', () => {
        render(<LoginForm onSubmit={mockOnSubmit} loading={true} />)

        const usernameInput = screen.getByLabelText('Username')
        const passwordInput = screen.getByLabelText('Password')
        const submitButton = screen.getByRole('button', { name: /signing in.../i })

        expect(usernameInput).toBeDisabled()
        expect(passwordInput).toBeDisabled()
        expect(submitButton).toBeDisabled()
    })
})
