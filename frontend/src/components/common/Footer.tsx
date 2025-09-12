import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';

export function Footer() {
    return (
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                    {/* Logo and description */}
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <DocumentDuplicateIcon className="h-6 w-6 text-primary-600" />
                        <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                PasteVault
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Secure, self-hosted pastebin
                            </div>
                        </div>
                    </div>

                    {/* Links */}
                    <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <a
                            href="https://github.com/LonleySailor/pastevault"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            GitHub
                        </a>
                        <a
                            href="/api/health"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            API Status
                        </a>
                        <span className="text-xs">
                            Made with ❤️ by LonleySailor
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
