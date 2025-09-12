import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    LockClosedIcon,
    EyeIcon,
    EyeSlashIcon,
    ExclamationCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { PasteViewer } from '../components/paste/PasteViewer';
import { Loading } from '../components/common/Loading';
import { usePaste } from '../hooks/usePaste';
import toast from 'react-hot-toast';

export function ViewPastePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { paste, loading, error, getPaste, unlockPaste, clearError } = usePaste();
    const [password, setPassword] = useState('');
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);

    useEffect(() => {
        if (!id) {
            navigate('/');
            return;
        }

        const loadPaste = async () => {
            try {
                await getPaste(id);
            } catch (err: any) {
                if (err.code === 'password_required') {
                    setShowPasswordInput(true);
                }
            }
        };

        loadPaste();
    }, [id, getPaste, navigate]);

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password.trim() || !id) return;

        setIsUnlocking(true);
        try {
            await unlockPaste(id, password);
            setShowPasswordInput(false);
            setPassword('');
            toast.success('Paste unlocked successfully!');
        } catch (err) {
            toast.error('Invalid password');
        } finally {
            setIsUnlocking(false);
        }
    };

    const handleTryAgain = () => {
        if (!id) return;
        clearError();
        getPaste(id);
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Loading text="Loading paste..." />
            </div>
        );
    }

    if (error && !showPasswordInput) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />

                    {error.code === 'paste_not_found' && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Paste Not Found
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                The paste you're looking for doesn't exist or may have been deleted.
                            </p>
                        </>
                    )}

                    {error.code === 'paste_expired' && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Paste Expired
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                This paste has expired and is no longer available.
                            </p>
                        </>
                    )}

                    {!error.code && (
                        <>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Error Loading Paste
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                {error.error || 'An unexpected error occurred while loading the paste.'}
                            </p>
                        </>
                    )}

                    <div className="space-x-4">
                        <button
                            onClick={handleTryAgain}
                            className="btn-primary"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="btn-secondary"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showPasswordInput) {
        return (
            <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <div className="text-center mb-6">
                        <LockClosedIcon className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Password Protected
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            This paste is password protected. Enter the password to view it.
                        </p>
                    </div>

                    <form onSubmit={handlePasswordSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="input-field pr-10"
                                    disabled={isUnlocking}
                                    required
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    disabled={isUnlocking}
                                >
                                    {showPassword ? (
                                        <EyeSlashIcon className="h-5 w-5" />
                                    ) : (
                                        <EyeIcon className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!password.trim() || isUnlocking}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isUnlocking && (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            )}
                            <span>{isUnlocking ? 'Unlocking...' : 'Unlock Paste'}</span>
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => navigate('/')}
                            className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!paste) {
        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                        No content to display
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                        The paste content could not be loaded.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                            Paste: {id}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {paste.language && (
                                <span className="capitalize">{paste.language} • </span>
                            )}
                            {paste.content.length.toLocaleString()} characters
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/create')}
                        className="btn-primary"
                    >
                        Create New Paste
                    </button>
                </div>
            </div>

            <PasteViewer paste={paste} />
        </div>
    );
}
