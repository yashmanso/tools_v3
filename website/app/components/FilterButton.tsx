'use client';

interface FilterButtonProps {
  onClick: () => void;
  isActive?: boolean;
  activeFilterCount?: number;
}

export function FilterButton({ onClick, isActive = false, activeFilterCount = 0 }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 rounded-full border transition-colors flex items-center gap-2 ${
        isActive
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500'
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
    </button>
  );
}
