import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
    DocumentDuplicateIcon,
    MoonIcon,
    SunIcon,
    ComputerDesktopIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../context/ThemeContext';
import { useAuthContext } from '../../context/AuthContext';
import { UserDropdown } from './UserDropdown';

export function Header() {
    const { theme, setTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuthContext();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const themeIcons = {
        light: SunIcon,
        dark: MoonIcon,
        system: ComputerDesktopIcon,
    };

    const ThemeIcon = themeIcons[theme];

    const cycleTheme = () => {
        const themes: Array<typeof theme> = ['light', 'dark', 'system'];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        setTheme(themes[nextIndex]);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and brand */}
                    <Link to="/" className="flex items-center space-x-2">
                        <DocumentDuplicateIcon className="h-8 w-8 text-primary-600" />
                        <span className="text-xl font-bold text-gray-900 dark:text-white">
                            PasteVault
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/create"
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                        >
                            Create Paste
                        </Link>
                        {isAuthenticated && (
                            <Link
                                to="/dashboard"
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                            >
                                My Pastes
                            </Link>
                        )}
                    </nav>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-4">
                        {/* Theme toggle */}
                        <button
                            onClick={cycleTheme}
                            className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            title={`Current theme: ${theme}`}
                        >
                            <ThemeIcon className="h-5 w-5" />
                        </button>

                        {/* Authentication */}
                        {isAuthenticated ? (
                            <UserDropdown user={user} onLogout={logout} />
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/login"
                                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-primary"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile navigation */}
            <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 py-3 space-y-1">
                    <Link
                        to="/create"
                        className="block px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Create Paste
                    </Link>
                    {isAuthenticated && (
                        <Link
                            to="/dashboard"
                            className="block px-3 py-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            My Pastes
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
