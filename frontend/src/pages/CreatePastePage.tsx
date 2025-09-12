import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PasteForm } from '../components/paste/PasteForm';
import { useCreatePaste } from '../hooks/usePaste';
import { useLocalStorage } from '../hooks/useLocalStorage';
import toast from 'react-hot-toast';
import type { PasteFormData } from '../types/paste';

export function CreatePastePage() {
    const navigate = useNavigate();
    const { createPaste, loading, error } = useCreatePaste();
    const [drafts, setDrafts] = useLocalStorage<PasteFormData[]>('paste_drafts', []);
    const [currentDraft, setCurrentDraft] = useState<PasteFormData>({
        content: '',
        language: 'plain',
        password: '',
        expiry: '24h',
        title: '',
    });

    const handleSubmit = async (data: PasteFormData) => {
        try {
            const response = await createPaste({
                content: data.content,
                language: data.language || 'plain',
                password: data.password,
                expiry: data.expiry,
            });

            // Clear current draft on successful creation
            setCurrentDraft({
                content: '',
                language: 'plain',
                password: '',
                expiry: '24h',
                title: '',
            });

            // Remove from drafts if it was saved
            setDrafts(prev => prev.filter(draft => draft.content !== data.content));

            toast.success('Paste created successfully!');
            navigate(`/p/${response.id}`);
        } catch (err) {
            console.error('Failed to create paste:', err);
            toast.error(error?.error || 'Failed to create paste');
        }
    };

    const saveDraft = () => {
        if (!currentDraft.content.trim()) {
            toast.error('Cannot save empty draft');
            return;
        }

        const existingDraftIndex = drafts.findIndex(
            draft => draft.content === currentDraft.content
        );

        if (existingDraftIndex !== -1) {
            // Update existing draft
            const updatedDrafts = [...drafts];
            updatedDrafts[existingDraftIndex] = {
                ...currentDraft,
                title: currentDraft.title || `Draft ${new Date().toLocaleString()}`,
            };
            setDrafts(updatedDrafts);
        } else {
            // Add new draft
            setDrafts(prev => [
                ...prev.slice(-4), // Keep only last 5 drafts
                {
                    ...currentDraft,
                    title: currentDraft.title || `Draft ${new Date().toLocaleString()}`,
                },
            ]);
        }

        toast.success('Draft saved!');
    };

    const loadDraft = (draft: PasteFormData) => {
        setCurrentDraft(draft);
        toast.success('Draft loaded!');
    };

    const deleteDraft = (index: number) => {
        setDrafts(prev => prev.filter((_, i) => i !== index));
        toast.success('Draft deleted!');
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Create New Paste
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Share your code, text, or documents securely with optional password protection and expiration.
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                        Error creating paste
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                        {error.error}
                    </p>
                    {error.details?.errors && (
                        <ul className="mt-2 text-sm text-red-600 dark:text-red-400 list-disc list-inside">
                            {error.details.errors.map((err: any, index: number) => (
                                <li key={index}>{err.message}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Drafts Section */}
            {drafts.length > 0 && (
                <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                        Saved Drafts
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {drafts.map((draft, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {draft.title || 'Untitled Draft'}
                                    </h3>
                                    <button
                                        onClick={() => deleteDraft(index)}
                                        className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                                    >
                                        Delete
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    {draft.content.substring(0, 100)}...
                                </p>
                                <button
                                    onClick={() => loadDraft(draft)}
                                    className="text-xs text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
                                >
                                    Load Draft
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Form */}
            <div className="space-y-6">
                <PasteForm
                    onSubmit={handleSubmit}
                    loading={loading}
                />

                {/* Draft Actions */}
                <div className="flex justify-between items-center">
                    <button
                        onClick={saveDraft}
                        className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 underline"
                        disabled={!currentDraft.content.trim()}
                    >
                        Save as Draft
                    </button>

                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        Press Ctrl+Enter to submit quickly
                    </div>
                </div>
            </div>

            {/* Tips */}
            <div className="mt-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    💡 Tips for better pastes
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Use descriptive titles to organize your pastes</li>
                    <li>• Select the correct language for syntax highlighting</li>
                    <li>• Add password protection for sensitive content</li>
                    <li>• Set appropriate expiration times to manage storage</li>
                    <li>• Save drafts while working on long content</li>
                </ul>
            </div>
        </div>
    );
}
