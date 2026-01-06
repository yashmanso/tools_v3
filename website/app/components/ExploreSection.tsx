'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ResourceMetadata } from '../lib/markdown';
import { ToolFinder } from './ToolFinder';

interface ExploreSectionProps {
  allResources: ResourceMetadata[];
}

export function ExploreSection({ allResources }: ExploreSectionProps) {
  const [mode, setMode] = useState<'select' | 'browse' | 'find'>('select');

  if (mode === 'browse') {
    return (
      <section className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <button
            onClick={() => setMode('select')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-flex items-center gap-2"
          >
            ← Back to options
          </button>
          <h2 className="text-2xl font-bold mb-4">Browse Our Collection</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Explore our comprehensive collection of tools, methods, frameworks, and resources. 
            Filter by category, search by keywords, or browse by tags to discover what interests you.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/tools"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors hover:no-underline"
          >
            Browse All Tools
          </Link>
          <Link
            href="/collections"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors hover:no-underline"
          >
            View Collections
          </Link>
          <Link
            href="/articles"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors hover:no-underline"
          >
            Read Articles
          </Link>
        </div>
      </section>
    );
  }

  if (mode === 'find') {
    return (
      <section className="py-8 border-t border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <button
            onClick={() => setMode('select')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-flex items-center gap-2"
          >
            ← Back to options
          </button>
        </div>
        <ToolFinder allResources={allResources} />
      </section>
    );
  }

  return (
    <section className="text-center py-12 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-3xl font-bold mb-4">Start Exploring</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        Choose how you'd like to discover tools and resources for your sustainable innovation journey.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {/* Browse Option */}
        <button
          onClick={() => setMode('browse')}
          className="group p-8 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left hover:shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            Browse & Explore
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Explore our full collection at your own pace. Browse by category, search by keywords, 
            or filter by tags. Perfect for discovering what's available and getting inspired.
          </p>
          <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium">
            Start browsing →
          </div>
        </button>

        {/* Find Tool Option */}
        <button
          onClick={() => setMode('find')}
          className="group p-8 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all text-left hover:shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            Find Your Tool
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Answer a few quick questions about your needs, context, and goals. 
            We'll recommend the most relevant tools tailored to your specific situation.
          </p>
          <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium">
            Start questionnaire →
          </div>
        </button>
      </div>
    </section>
  );
}

