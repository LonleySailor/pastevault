import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export function Breadcrumbs() {
    const location = useLocation();
    const pathname = location.pathname;

    // Generate breadcrumbs based on current path
    const generateBreadcrumbs = (): BreadcrumbItem[] => {
        const segments = pathname.split('/').filter(Boolean);
        const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];

        if (segments.length === 0) {
            return breadcrumbs;
        }

        const pathMap: Record<string, string> = {
            'create': 'Create Paste',
            'p': 'View Paste',
            'login': 'Login',
            'register': 'Register',
            'dashboard': 'Dashboard',
            'profile': 'Profile',
            'settings': 'Settings',
        };

        segments.forEach((segment, index) => {
            const isLast = index === segments.length - 1;
            const label = pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

            if (isLast) {
                breadcrumbs.push({ label });
            } else {
                const href = '/' + segments.slice(0, index + 1).join('/');
                breadcrumbs.push({ label, href });
            }
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    if (breadcrumbs.length <= 1) {
        return null;
    }

    return (
        <nav aria-label="Breadcrumb" className="mb-4">
            <ol className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((item, index) => (
                    <li key={index} className="flex items-center">
                        {index > 0 && (
                            <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" aria-hidden="true" />
                        )}
                        {item.href ? (
                            <Link
                                to={item.href}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}