import { useState } from 'react';
import {
    ClockIcon,
    LockClosedIcon,
    DocumentTextIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { EXPIRY_OPTIONS } from '../../utils/constants';
import type { ExpiryOption } from '../../types/paste';

interface PasteSettingsProps {
    title: string;
    onTitleChange: (title: string) => void;
    expiry: ExpiryOption;
    onExpiryChange: (expiry: ExpiryOption) => void;
    password: string;
    onPasswordChange: (password: string) => void;
    usePassword: boolean;
    onUsePasswordChange: (usePassword: boolean) => void;
    language: string;
    onLanguageChange: (language: string) => void;
    disabled?: boolean;
}

export function PasteSettings({
    title,
    onTitleChange,
    expiry,
    onExpiryChange,
    password,
    onPasswordChange,
    usePassword,
    onUsePasswordChange,
    language,
    onLanguageChange,
    disabled = false,
}: PasteSettingsProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Paste Settings
                </h3>
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                    {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                </button>
            </div>

            {/* Basic Settings */}
            <div className="space-y-4">
                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                        Title (optional)
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => onTitleChange(e.target.value)}
                        placeholder="Give your paste a descriptive title..."
                        className="input-field"
                        disabled={disabled}
                        maxLength={100}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {title.length}/100 characters
                    </p>
                </div>

                {/* Expiry */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <ClockIcon className="h-4 w-4 inline mr-1" />
                        Expiry
                    </label>
                    <select
                        value={expiry}
                        onChange={(e) => onExpiryChange(e.target.value as ExpiryOption)}
                        className="input-field"
                        disabled={disabled}
                    >
                        {EXPIRY_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {expiry === 'never' && (
                        <div className="flex items-center space-x-2 mt-2 text-xs text-amber-600 dark:text-amber-400">
                            <ExclamationTriangleIcon className="h-4 w-4" />
                            <span>Anonymous pastes without expiry will be deleted after 30 days</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Advanced Settings */}
            {showAdvanced && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {/* Language */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Language
                        </label>
                        <select
                            value={language}
                            onChange={(e) => onLanguageChange(e.target.value)}
                            className="input-field"
                            disabled={disabled}
                        >
                            <option value="plain">Auto-detect / Plain Text</option>
                            <optgroup label="Popular Languages">
                                <option value="javascript">JavaScript</option>
                                <option value="typescript">TypeScript</option>
                                <option value="python">Python</option>
                                <option value="java">Java</option>
                                <option value="go">Go</option>
                                <option value="rust">Rust</option>
                            </optgroup>
                            <optgroup label="Web Technologies">
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                                <option value="scss">SCSS</option>
                                <option value="json">JSON</option>
                                <option value="xml">XML</option>
                            </optgroup>
                            <optgroup label="Systems Programming">
                                <option value="cpp">C++</option>
                                <option value="c">C</option>
                                <option value="csharp">C#</option>
                                <option value="swift">Swift</option>
                                <option value="kotlin">Kotlin</option>
                            </optgroup>
                            <optgroup label="Other Languages">
                                <option value="php">PHP</option>
                                <option value="ruby">Ruby</option>
                                <option value="scala">Scala</option>
                                <option value="bash">Bash</option>
                                <option value="sql">SQL</option>
                                <option value="yaml">YAML</option>
                                <option value="toml">TOML</option>
                                <option value="markdown">Markdown</option>
                                <option value="dockerfile">Dockerfile</option>
                            </optgroup>
                        </select>
                    </div>

                    {/* Password Protection */}
                    <div>
                        <div className="flex items-center space-x-2 mb-3">
                            <input
                                type="checkbox"
                                id="use-password-settings"
                                checked={usePassword}
                                onChange={(e) => onUsePasswordChange(e.target.checked)}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                disabled={disabled}
                            />
                            <label htmlFor="use-password-settings" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                <LockClosedIcon className="h-4 w-4 inline mr-1" />
                                Password protect this paste
                            </label>
                        </div>

                        {usePassword && (
                            <div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => onPasswordChange(e.target.value)}
                                    placeholder="Enter a secure password (minimum 8 characters)"
                                    className="input-field"
                                    disabled={disabled}
                                    minLength={8}
                                />
                                <div className="mt-2 space-y-1">
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Password strength:
                                    </div>
                                    <div className="flex space-x-1">
                                        {[...Array(4)].map((_, i) => {
                                            let strength = 0;
                                            if (password.length >= 8) strength++;
                                            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
                                            if (/[0-9]/.test(password)) strength++;
                                            if (/[^a-zA-Z0-9]/.test(password)) strength++;

                                            return (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded ${i < strength
                                                            ? strength <= 1
                                                                ? 'bg-red-500'
                                                                : strength <= 2
                                                                    ? 'bg-yellow-500'
                                                                    : strength <= 3
                                                                        ? 'bg-blue-500'
                                                                        : 'bg-green-500'
                                                            : 'bg-gray-300 dark:bg-gray-600'
                                                        }`}
                                                />
                                            );
                                        })}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        Use a mix of letters, numbers, and symbols for better security
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
