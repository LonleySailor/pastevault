import React, { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface UserSettings {
  defaultExpiry: string;
  defaultLanguage: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  publicPastesByDefault: boolean;
}

export function SettingsPage() {
  const { isAuthenticated, loading } = useAuthContext();

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

  const [settings, setSettings] = useState<UserSettings>({
    defaultExpiry: '1h',
    defaultLanguage: 'plaintext',
    theme: 'system',
    notifications: true,
    publicPastesByDefault: false,
  });

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle settings update
    console.log('Settings updated:', settings);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header spacer */}
      <div className="h-16" />

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Customize your PrivatePaste experience
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-8">
              {/* Paste Defaults */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Paste Defaults
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="defaultExpiry" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Default Expiry
                    </label>
                    <select
                      id="defaultExpiry"
                      value={settings.defaultExpiry}
                      onChange={(e) => handleSettingChange('defaultExpiry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="never">Never</option>
                      <option value="10m">10 Minutes</option>
                      <option value="1h">1 Hour</option>
                      <option value="1d">1 Day</option>
                      <option value="1w">1 Week</option>
                      <option value="2w">2 Weeks</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="defaultLanguage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Default Language
                    </label>
                    <select
                      id="defaultLanguage"
                      value={settings.defaultLanguage}
                      onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="plaintext">Plain Text</option>
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="json">JSON</option>
                      <option value="markdown">Markdown</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="publicPastesByDefault"
                      checked={settings.publicPastesByDefault}
                      onChange={(e) => handleSettingChange('publicPastesByDefault', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="publicPastesByDefault" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Make pastes public by default
                    </label>
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Appearance
                </h2>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="theme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Theme
                    </label>
                    <select
                      id="theme"
                      value={settings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value as 'light' | 'dark' | 'system')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Default</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Privacy */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Privacy
                </h2>

                <div className="space-y-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      Your pastes are private by default unless you choose to make them public.
                    </p>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Notifications
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifications"
                      checked={settings.notifications}
                      onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Email notifications for account activity
                    </label>
                  </div>
                </div>
              </div>

              {/* Advanced */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Advanced
                </h2>

                <div className="space-y-4">
                  <div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Export Data
                    </button>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Download a copy of your data
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      API Access Tokens
                    </button>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      Manage API tokens for programmatic access
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
