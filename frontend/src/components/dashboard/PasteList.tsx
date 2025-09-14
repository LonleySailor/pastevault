import type { PasteListItem } from '../../types/paste';
import { PasteCard } from './PasteCard';

interface PasteListProps {
  pastes: PasteListItem[];
  onDelete: (id: string) => void;
  onView: (id: string) => void;
  loading?: boolean;
}

export function PasteList({ pastes, onDelete, onView, loading = false }: PasteListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              </div>
              <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (pastes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No pastes found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          You haven't created any pastes yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pastes.map((paste) => (
        <PasteCard
          key={paste.id}
          paste={paste}
          onView={onView}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
