import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';
import { useAuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

export function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const { login } = useAuthContext();
    const navigate = useNavigate();

    const handleLogin = async (username: string, password: string) => {
        setLoading(true);
        setError('');

        try {
            await login({ username, password });
            toast.success('Successfully signed in!');
            navigate('/dashboard');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            {/* Header spacer */}
            <div className="h-16" />

            {/* Main content */}
            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    <LoginForm
                        onSubmit={handleLogin}
                        loading={loading}
                        error={error}
                    />
                </div>
            </div>

            {/* Footer spacer */}
            <div className="h-16" />
        </div>
    );
}
