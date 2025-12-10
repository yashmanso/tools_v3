'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface Resource {
  slug: string;
  title: string;
  category: string;
  tags: string[];
}

interface TagModalProps {
  tag: string;
  resources: Resource[];
  onClose: () => void;
}

export function TagModal({ tag, resources, onClose }: TagModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  // Filter resources by tag
  const filteredResources = resources.filter((resource) =>
    resource.tags.includes(tag)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              #{tag}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {filteredResources.length} {filteredResources.length === 1 ? 'page' : 'pages'} found
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            title="Close (Esc)"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredResources.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No pages found with this tag
            </p>
          ) : (
            <div className="space-y-3">
              {filteredResources.map((resource) => (
                <Link
                  key={`${resource.category}-${resource.slug}`}
                  href={`/${resource.category}/${resource.slug}`}
                  onClick={onClose}
                  className="block p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700
                    hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-gray-800
                    transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100
                        group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">
                        {resource.category}
                      </p>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
