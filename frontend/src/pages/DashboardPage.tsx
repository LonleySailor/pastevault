import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { ClipboardDocumentListIcon, UserCircleIcon, Cog6ToothIcon, PlusIcon } from '@heroicons/react/24/outline';

export function DashboardPage() {
    const { user, isAuthenticated, loading } = useAuth();

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary-600 border-t-transparent" />
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header spacer */}
            <div className="h-16" />

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {user?.username}!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage your pastes and account settings
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-center space-x-3">
                            <PlusIcon className="h-8 w-8 text-primary-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Create Paste</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Start a new paste</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-center space-x-3">
                            <ClipboardDocumentListIcon className="h-8 w-8 text-green-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">My Pastes</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">View all your pastes</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-center space-x-3">
                            <UserCircleIcon className="h-8 w-8 text-blue-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Profile</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Edit your profile</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-center space-x-3">
                            <Cog6ToothIcon className="h-8 w-8 text-gray-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Settings</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Account settings</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Pastes */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Pastes</h2>
                    </div>
                    <div className="p-6">
                        <div className="text-center py-12">
                            <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                No pastes yet
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Create your first paste to get started
                            </p>
                            <button className="btn-primary">
                                Create Your First Paste
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary-600 mb-2">0</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Pastes</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">0</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Public Pastes</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">0</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Private Pastes</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
