'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ResourceMetadata } from '../lib/markdown';
import { ToolFinder } from './ToolFinder';
import { CompareTools } from './CompareTools';

interface ExploreSectionProps {
  allResources: ResourceMetadata[];
}

export function ExploreSection({ allResources }: ExploreSectionProps) {
  const [mode, setMode] = useState<'select' | 'browse' | 'find' | 'compare'>('select');

  if (mode === 'browse') {
    return (
      <section className="text-center py-8 bg-[var(--bg-primary)]">
        <div className="mb-6">
          <button
            onClick={() => setMode('select')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-flex items-center gap-2"
          >
            ← Back to options
          </button>
          <h2 className="text-2xl font-bold mb-4">Browse our collection</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Explore our comprehensive collection of tools, methods, frameworks, and resources. 
            Filter by category, search by keywords, or browse by tags to discover what interests you.
          </p>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="/tools"
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors hover:no-underline"
          >
            Browse all tools
          </Link>
          <Link
            href="/collections"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full hover:border-blue-500 dark:hover:border-blue-500 transition-colors hover:no-underline"
          >
            View collections
          </Link>
          <Link
            href="/articles"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-full hover:border-blue-500 dark:hover:border-blue-500 transition-colors hover:no-underline"
          >
            Read articles
          </Link>
        </div>
      </section>
    );
  }

  if (mode === 'find') {
    return (
      <section className="py-8 bg-[var(--bg-primary)]">
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

  if (mode === 'compare') {
    return (
      <section className="py-8 bg-[var(--bg-primary)]">
        <div className="mb-6">
          <button
            onClick={() => setMode('select')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-flex items-center gap-2"
          >
            ← Back to options
          </button>
        </div>
        <CompareTools allResources={allResources} />
      </section>
    );
  }

  return (
    <section className="text-center py-12 bg-[var(--bg-primary)]">
      <h2 className="text-3xl font-bold mb-4">Start exploring</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        Choose how you'd like to discover tools and resources for your sustainable innovation journey.
      </p>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {/* Browse Option */}
        <button
          onClick={() => setMode('browse')}
          className="group p-8 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left bg-[var(--bg-secondary)]"
        >
          <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
            Browse & explore
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
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
          className="group p-8 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left bg-[var(--bg-secondary)]"
        >
          <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
            Find your tool
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Answer a few quick questions about your needs, context, and goals. 
            We'll recommend the most relevant tools tailored to your specific situation.
          </p>
          <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium">
            Start questionnaire →
          </div>
        </button>

        {/* Compare Tools Option */}
        <button
          onClick={() => setMode('compare')}
          className="group p-8 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left bg-[var(--bg-secondary)]"
        >
          <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
            Compare tools
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Select up to 3 tools and see how they differ across dimensions, features, and use cases. 
            Perfect for choosing the right tool for your needs.
          </p>
          <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium">
            Start comparing →
          </div>
        </button>
      </div>
    </section>
  );
}

