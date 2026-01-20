'use client';

import { Button } from '@/components/ui/button';

interface FilterButtonProps {
  onClick: () => void;
  isActive?: boolean;
  activeFilterCount?: number;
}

export function FilterButton({ onClick, isActive = false, activeFilterCount = 0 }: FilterButtonProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <Button variant="ghost"
        onClick={onClick}
        className={`relative px-3 py-1.5 rounded-full transition-colors flex items-center gap-2 h-9 ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
        }`}
        aria-label="Toggle filters"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-sm font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
            {activeFilterCount}
          </span>
        )}
      </Button>
    </div>
  );
}
