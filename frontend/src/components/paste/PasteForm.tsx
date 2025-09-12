import { useState } from 'react';
import {
    EyeIcon,
    EyeSlashIcon,
    ClockIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import { EXPIRY_OPTIONS } from '../../utils/constants';
import type { ExpiryOption, PasteFormData } from '../../types/paste';

interface PasteFormProps {
    onSubmit: (data: PasteFormData) => void;
    loading?: boolean;
    disabled?: boolean;
}

export function PasteForm({ onSubmit, loading = false, disabled = false }: PasteFormProps) {
    const [formData, setFormData] = useState<PasteFormData>({
        content: '',
        language: 'plain',
        password: '',
        expiry: '24h',
        title: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [usePassword, setUsePassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.content.trim()) {
            return;
        }

        const submitData: PasteFormData = {
            ...formData,
            password: usePassword ? formData.password : undefined,
        };

        onSubmit(submitData);
    };

    const handleContentChange = (content: string) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleLanguageChange = (language: string) => {
        setFormData(prev => ({ ...prev, language }));
    };

    const isFormValid = formData.content.trim().length > 0 &&
        (!usePassword || (formData.password && formData.password.length >= 8));

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title (optional) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <DocumentTextIcon className="h-4 w-4 inline mr-1" />
                        Title (optional)
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Give your paste a descriptive title..."
                        className="input-field"
                        disabled={disabled}
                    />
                </div>

                {/* Content */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content *
                    </label>
                    <div className="space-y-2">
                        <textarea
                            value={formData.content}
                            onChange={(e) => handleContentChange(e.target.value)}
                            placeholder="Paste your content here..."
                            className="input-field min-h-[200px] font-mono text-sm"
                            disabled={disabled}
                            required
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formData.content.length.toLocaleString()} / 1,048,576 characters
                            {formData.content.length > 1048576 && (
                                <span className="text-red-500 ml-2">Content too large!</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Settings Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Language */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Language
                        </label>
                        <select
                            value={formData.language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="input-field"
                            disabled={disabled}
                        >
                            <option value="plain">Plain Text</option>
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="c">C</option>
                            <option value="csharp">C#</option>
                            <option value="php">PHP</option>
                            <option value="ruby">Ruby</option>
                            <option value="go">Go</option>
                            <option value="rust">Rust</option>
                            <option value="swift">Swift</option>
                            <option value="kotlin">Kotlin</option>
                            <option value="scala">Scala</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="scss">SCSS</option>
                            <option value="sass">Sass</option>
                            <option value="json">JSON</option>
                            <option value="xml">XML</option>
                            <option value="yaml">YAML</option>
                            <option value="toml">TOML</option>
                            <option value="markdown">Markdown</option>
                            <option value="bash">Bash</option>
                            <option value="shell">Shell</option>
                            <option value="sql">SQL</option>
                            <option value="dockerfile">Dockerfile</option>
                        </select>
                    </div>

                    {/* Expiry */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            <ClockIcon className="h-4 w-4 inline mr-1" />
                            Expires
                        </label>
                        <select
                            value={formData.expiry}
                            onChange={(e) => setFormData(prev => ({ ...prev, expiry: e.target.value as ExpiryOption }))}
                            className="input-field"
                            disabled={disabled}
                        >
                            {EXPIRY_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Password Protection */}
                <div>
                    <div className="flex items-center space-x-2 mb-3">
                        <input
                            type="checkbox"
                            id="use-password"
                            checked={usePassword}
                            onChange={(e) => setUsePassword(e.target.checked)}
                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            disabled={disabled}
                        />
                        <label htmlFor="use-password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            <EyeSlashIcon className="h-4 w-4 inline mr-1" />
                            Password protect this paste
                        </label>
                    </div>

                    {usePassword && (
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Enter a password (minimum 8 characters)"
                                className="input-field pr-10"
                                disabled={disabled}
                                minLength={8}
                                required={usePassword}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                disabled={disabled}
                            >
                                {showPassword ? (
                                    <EyeSlashIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                            {formData.password && formData.password.length < 8 && (
                                <p className="text-xs text-red-500 mt-1">
                                    Password must be at least 8 characters long
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={!isFormValid || loading || disabled}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {loading && (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        )}
                        <span>{loading ? 'Creating...' : 'Create Paste'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
