import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from '../../context/ThemeContext';
import { detectLanguage } from '../../utils/helpers';
import { API_CONFIG } from '../../utils/constants';

interface PasteEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: string;
    onLanguageChange: (language: string) => void;
    readOnly?: boolean;
    height?: string;
}

export function PasteEditor({
    value,
    onChange,
    language,
    onLanguageChange,
    readOnly = false,
    height = '400px'
}: PasteEditorProps) {
    const { actualTheme } = useTheme();
    const [isEditorReady, setIsEditorReady] = useState(false);
    const editorRef = useRef<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
        setIsEditorReady(true);
    };

    const handleEditorChange = (value: string | undefined) => {
        const newValue = value || '';
        onChange(newValue);

        // Auto-detect language if content changes significantly
        if (newValue.length > 50 && language === 'plain') {
            const detectedLang = detectLanguage(newValue);
            if (detectedLang !== 'plain') {
                onLanguageChange(detectedLang);
            }
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check file size (1MB limit)
        if (file.size > API_CONFIG.MAX_PASTE_SIZE) {
            alert('File is too large. Maximum size is 1MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            onChange(content);

            // Detect language from filename
            const detectedLang = detectLanguage(content, file.name);
            onLanguageChange(detectedLang);
        };
        reader.readAsText(file);
    };

    const pasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            onChange(text);
        } catch (error) {
            console.warn('Failed to read from clipboard:', error);
        }
    };

    return (
        <div className="space-y-4">
            {/* Editor toolbar */}
            {!readOnly && (
                <div className="flex flex-wrap items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-t-lg border-b border-gray-200 dark:border-gray-700">
                    {/* Language selector */}
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Language:
                        </label>
                        <select
                            value={language}
                            onChange={(e) => onLanguageChange(e.target.value)}
                            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="plain">Plain Text</option>
                            {API_CONFIG.SUPPORTED_LANGUAGES.map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* File upload */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Upload File
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".txt,.js,.ts,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.html,.css,.scss,.sass,.json,.xml,.yml,.yaml,.toml,.md,.sh,.sql"
                        onChange={handleFileUpload}
                        className="hidden"
                    />

                    {/* Paste from clipboard */}
                    <button
                        onClick={pasteFromClipboard}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Paste from Clipboard
                    </button>

                    {/* Character count */}
                    <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                        {value.length.toLocaleString()} / {API_CONFIG.MAX_PASTE_SIZE.toLocaleString()} characters
                    </div>
                </div>
            )}

            {/* Monaco Editor */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden">
                <Editor
                    height={height}
                    language={language === 'plain' ? 'plaintext' : language}
                    value={value}
                    onChange={handleEditorChange}
                    onMount={handleEditorDidMount}
                    theme={actualTheme === 'dark' ? 'vs-dark' : 'light'}
                    options={{
                        readOnly,
                        minimap: { enabled: value.length > 1000 },
                        lineNumbers: 'on',
                        wordWrap: 'on',
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        fontSize: 14,
                        fontFamily: 'JetBrains Mono, Monaco, Cascadia Code, Roboto Mono, monospace',
                        tabSize: 2,
                        insertSpaces: true,
                        detectIndentation: true,
                        folding: true,
                        foldingHighlight: true,
                        showFoldingControls: 'always',
                        bracketPairColorization: { enabled: true },
                        guides: {
                            indentation: true,
                            bracketPairs: true,
                        },
                        renderWhitespace: 'selection',
                        cursorBlinking: 'smooth',
                        smoothScrolling: true,
                    }}
                    loading={
                        <div className="flex items-center justify-center h-full">
                            <div className="text-gray-500 dark:text-gray-400">Loading editor...</div>
                        </div>
                    }
                />
            </div>

            {/* Editor status */}
            {isEditorReady && !readOnly && (
                <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                    <span>
                        Lines: {value.split('\n').length} •
                        Words: {value.split(/\s+/).filter(word => word.length > 0).length}
                    </span>
                    <span>
                        Ctrl+S to save • Ctrl+A to select all
                    </span>
                </div>
            )}
        </div>
    );
}
