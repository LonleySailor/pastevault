import { useState } from 'react';
import {
    ClipboardDocumentIcon,
    ArrowDownTrayIcon,
    ShareIcon,
    EyeIcon,
    EyeSlashIcon,
    CalendarIcon,
    CodeBracketIcon
} from '@heroicons/react/24/outline';
import { PasteEditor } from './PasteEditor';
import { formatDate, getTimeRemaining, copyToClipboard, generatePasteURL } from '../../utils/helpers';
import type { Paste } from '../../types/paste';
import toast from 'react-hot-toast';

interface PasteViewerProps {
    paste: Paste;
    showMetadata?: boolean;
}

export function PasteViewer({ paste, showMetadata = true }: PasteViewerProps) {
    const [showPassword, setShowPassword] = useState(false);

    const handleCopyContent = async () => {
        const success = await copyToClipboard(paste.content);
        if (success) {
            toast.success('Content copied to clipboard!');
        } else {
            toast.error('Failed to copy content');
        }
    };

    const handleShare = async () => {
        const url = generatePasteURL(paste.id);

        // Check if we can use the native share API
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `PrivatePaste - ${paste.id}`,
                    text: 'Check out this paste',
                    url: url,
                });
            } catch (error) {
                // User cancelled or share failed, fallback to copy
                const success = await copyToClipboard(url);
                if (success) {
                    toast.success('URL copied to clipboard!');
                }
            }
        } else {
            // Fallback to copy
            const success = await copyToClipboard(url);
            if (success) {
                toast.success('URL copied to clipboard!');
            } else {
                toast.error('Failed to copy URL');
            }
        }
    };

    const getFileExtension = (language?: string): string => {
        const extensions: Record<string, string> = {
            javascript: 'js',
            typescript: 'ts',
            python: 'py',
            java: 'java',
            cpp: 'cpp',
            css: 'css',
            html: 'html',
            json: 'json',
            xml: 'xml',
            yaml: 'yaml',
            markdown: 'md',
            sql: 'sql',
            shell: 'sh',
            go: 'go',
            rust: 'rs',
            php: 'php',
            ruby: 'rb',
            swift: 'swift',
            kotlin: 'kt',
            dart: 'dart',
        };
        return extensions[language || 'text'] || 'txt';
    };

    const handleDownload = () => {
        const fileName = `paste-${paste.id}.${getFileExtension(paste.language)}`;
        const blob = new Blob([paste.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(`Downloaded as ${fileName}`);
    };

    const formatExpiresAt = (expiresAt: string | undefined): string => {
        if (!expiresAt) return 'Never';

        const expiryDate = new Date(expiresAt);
        const now = new Date();

        if (expiryDate <= now) {
            return 'Expired';
        }

        const timeRemaining = getTimeRemaining(expiresAt);
        return `${formatDate(expiresAt)} (${timeRemaining})`;
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
            {showMetadata && (
                <div className="border-b dark:border-gray-700 p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>{formatDate(paste.created_at)}</span>
                                </div>
                                {paste.language && (
                                    <div className="flex items-center gap-1">
                                        <CodeBracketIcon className="h-4 w-4" />
                                        <span className="capitalize">{paste.language}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1">
                                    <span>Expires:</span>
                                    <span className={paste.expires_at && new Date(paste.expires_at) <= new Date() ? 'text-red-500' : ''}>
                                        {formatExpiresAt(paste.expires_at)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopyContent}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Copy content"
                            >
                                <ClipboardDocumentIcon className="h-4 w-4" />
                                <span>Copy</span>
                            </button>

                            <button
                                onClick={handleDownload}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Download paste"
                            >
                                <ArrowDownTrayIcon className="h-4 w-4" />
                                <span>Download</span>
                            </button>

                            <button
                                onClick={handleShare}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                                title="Share paste"
                            >
                                <ShareIcon className="h-4 w-4" />
                                <span>Share</span>
                            </button>
                        </div>
                    </div>

                    {paste.has_password && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                            <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="flex items-center gap-1 hover:text-amber-700 dark:hover:text-amber-300"
                            >
                                {showPassword ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                <span>Password protected</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <div className="relative">
                <PasteEditor
                    value={paste.content}
                    onChange={() => { }} // No-op since it's readonly
                    language={paste.language || 'text'}
                    onLanguageChange={() => { }} // No-op since it's readonly
                    readOnly={true}
                    height="400px"
                />
            </div>
        </div>
    );
}
