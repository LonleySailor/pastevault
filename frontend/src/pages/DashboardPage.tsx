import { useAuth } from '../hooks/useAuth';
import { Navigate, useNavigate } from 'react-router-dom';
import { ClipboardDocumentListIcon, UserCircleIcon, Cog6ToothIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useUserPastes } from '../hooks/usePaste';
import { PasteList } from '../components/dashboard/PasteList';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { Breadcrumbs } from '../components/common/Breadcrumbs';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export function DashboardPage() {
    const { user, isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const { pastes, loading: pastesLoading, fetchUserPastes, deletePaste } = useUserPastes();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalPastes, setTotalPastes] = useState(0);
    const [publicPastes, setPublicPastes] = useState(0);
    const [privatePastes, setPrivatePastes] = useState(0);

    // Fetch user pastes on component mount
    useEffect(() => {
        if (isAuthenticated) {
            fetchUserPastes();
        }
    }, [isAuthenticated, fetchUserPastes]);

    // Update stats when pastes change
    useEffect(() => {
        setTotalPastes(pastes.length);
        // For now, we can't distinguish between public/private in the list view
        // This would need to be added to the backend PasteListItem response
        setPublicPastes(0);
        setPrivatePastes(pastes.length);
    }, [pastes]);

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

    // Button click handlers
    const handleCreatePaste = () => navigate('/create');
    const handleMyPastes = () => setIsModalOpen(true);
    const handleProfile = () => navigate('/profile');
    const handleSettings = () => navigate('/settings');
    const handleCreateFirstPaste = () => navigate('/create');
    const handleCloseModal = () => setIsModalOpen(false);

    const handleViewPaste = (id: string) => {
        navigate(`/p/${id}`);
        handleCloseModal();
    };

    const handleDeletePaste = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this paste? This action cannot be undone.')) {
            try {
                await deletePaste(id);
                toast.success('Paste deleted successfully');
            } catch (err) {
                console.error('Failed to delete paste:', err);
                toast.error('Failed to delete paste');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header spacer */}
            <div className="h-16" />

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Breadcrumbs />
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
                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={handleCreatePaste}
                    >
                        <div className="flex items-center space-x-3">
                            <PlusIcon className="h-8 w-8 text-primary-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Create Paste</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Start a new paste</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={handleMyPastes}
                    >
                        <div className="flex items-center space-x-3">
                            <ClipboardDocumentListIcon className="h-8 w-8 text-green-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">My Pastes</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">View all your pastes</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={handleProfile}
                    >
                        <div className="flex items-center space-x-3">
                            <UserCircleIcon className="h-8 w-8 text-blue-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Profile</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Edit your profile</p>
                            </div>
                        </div>
                    </div>

                    <div
                        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={handleSettings}
                    >
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
                        {pastesLoading ? (
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 animate-pulse">
                                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : pastes.length > 0 ? (
                            <div className="space-y-4">
                                {pastes.slice(0, 5).map((paste) => (
                                    <div key={paste.id} className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                                {paste.id}
                                            </h3>
                                            <div className="mt-1 flex flex-wrap gap-2">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                                                    {paste.language || 'Plain Text'}
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                                                    {paste.has_password ? 'Protected' : 'Unprotected'}
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                                                    {paste.size} bytes
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/p/${paste.id}`)}
                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            View
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    No pastes yet
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Create your first paste to get started
                                </p>
                                <button
                                    className="btn-primary"
                                    onClick={handleCreateFirstPaste}
                                >
                                    Create Your First Paste
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-primary-600 mb-2">{totalPastes}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Total Pastes</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">{publicPastes}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Public Pastes</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">{privatePastes}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Private Pastes</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Pastes Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Pastes</h2>
                            <button
                                onClick={handleCloseModal}
                                className="text-gray-400 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-200"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {pastesLoading ? (
                                <LoadingSkeleton />
                            ) : (
                                <PasteList
                                    pastes={pastes}
                                    onDelete={handleDeletePaste}
                                    onView={handleViewPaste}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
