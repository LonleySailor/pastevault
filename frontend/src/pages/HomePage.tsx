import { Link } from 'react-router-dom';
import {
    DocumentDuplicateIcon,
    ShieldCheckIcon,
    ClockIcon,
    CodeBracketIcon,
    ArrowRightIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';

export function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Hero Section */}
            <div className="relative px-6 lg:px-8">
                <div className="mx-auto max-w-3xl pt-20 pb-32 sm:pt-48 sm:pb-40">
                    <div className="text-center">
                        <div className="flex justify-center mb-8">
                            <DocumentDuplicateIcon className="h-16 w-16 text-primary-600" />
                        </div>

                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
                            Share code
                            <span className="text-primary-600"> securely</span>
                        </h1>

                        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            PrivatePaste is a self-hosted, secure pastebin for sharing code snippets,
                            text, and documents with optional password protection and automatic expiration.
                        </p>

                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                to="/create"
                                className="btn-primary text-lg px-8 py-3 flex items-center space-x-2"
                            >
                                <span>Create Paste</span>
                                <ArrowRightIcon className="h-5 w-5" />
                            </Link>

                            <a
                                href="#features"
                                className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                Learn more <span aria-hidden="true">→</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="py-24 bg-white dark:bg-gray-800">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-primary-600">
                            Everything you need
                        </h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            Secure paste sharing made simple
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            Built with security and privacy in mind, PrivatePaste offers all the features
                            you need to share code and text safely.
                        </p>
                    </div>

                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {/* Feature 1 */}
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                    <ShieldCheckIcon className="h-5 w-5 flex-none text-primary-600" />
                                    Password Protection
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                                    <p className="flex-auto">
                                        Secure your pastes with optional password protection.
                                        Only those with the password can access your content.
                                    </p>
                                </dd>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                    <ClockIcon className="h-5 w-5 flex-none text-primary-600" />
                                    Auto Expiration
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                                    <p className="flex-auto">
                                        Set automatic expiration times for your pastes.
                                        Content is automatically deleted after the specified time.
                                    </p>
                                </dd>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                    <CodeBracketIcon className="h-5 w-5 flex-none text-primary-600" />
                                    Syntax Highlighting
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                                    <p className="flex-auto">
                                        Beautiful syntax highlighting for 25+ programming languages
                                        with VS Code-quality editor experience.
                                    </p>
                                </dd>
                            </div>

                            {/* Feature 4 */}
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                    <SparklesIcon className="h-5 w-5 flex-none text-primary-600" />
                                    Clean Interface
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                                    <p className="flex-auto">
                                        Modern, responsive design that works beautifully on desktop and mobile.
                                        Dark mode support included.
                                    </p>
                                </dd>
                            </div>

                            {/* Feature 5 */}
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                    <DocumentDuplicateIcon className="h-5 w-5 flex-none text-primary-600" />
                                    Multiple Formats
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                                    <p className="flex-auto">
                                        Support for code, plain text, and documents.
                                        Export as files or view raw content.
                                    </p>
                                </dd>
                            </div>

                            {/* Feature 6 */}
                            <div className="flex flex-col">
                                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                    <ShieldCheckIcon className="h-5 w-5 flex-none text-primary-600" />
                                    Self-Hosted
                                </dt>
                                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                                    <p className="flex-auto">
                                        Host your own instance for complete control over your data.
                                        No third-party dependencies.
                                    </p>
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-primary-600">
                <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Ready to get started?
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-200">
                            Create your first paste in seconds. No registration required
                            for basic usage.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                to="/create"
                                className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-primary-600 shadow-sm hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                            >
                                Create Paste Now
                            </Link>
                            <Link
                                to="/register"
                                className="text-sm font-semibold leading-6 text-white hover:text-primary-200 transition-colors"
                            >
                                Sign up for an account <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
