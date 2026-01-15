'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ResourceMetadata } from '../lib/markdown';
import { ToolFinder } from './ToolFinder';
import { CompareTools } from './CompareTools';
import { TimelineView } from './TimelineView';
import { NetworkGraph } from './NetworkGraph';
import { WorkflowBuilder } from './WorkflowBuilder';
import { ToolCompatibilityChecker } from './ToolCompatibilityChecker';
import { VisualToolSelector } from './VisualToolSelector';

interface ExploreSectionProps {
  allResources: ResourceMetadata[];
  graphData?: {
    nodes: Array<{ id: string; node: { slug: string; title: string; category: string; tags: string[] } }>;
    edges: Array<{ source: string; target: string; weight: number; reasons: string[] }>;
  };
}

export function ExploreSection({ allResources, graphData }: ExploreSectionProps) {
  const [mode, setMode] = useState<'select' | 'browse' | 'find' | 'compare' | 'timeline' | 'network' | 'workflows' | 'compatibility' | 'visual'>('select');

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

  if (mode === 'timeline') {
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
        <TimelineView allResources={allResources} />
      </section>
    );
  }

  if (mode === 'network') {
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
        {graphData ? (
          <NetworkGraph allResources={allResources} graphData={graphData} />
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Loading network graph...
          </div>
        )}
      </section>
    );
  }

  if (mode === 'workflows') {
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
        <WorkflowBuilder allResources={allResources} />
      </section>
    );
  }

  if (mode === 'compatibility') {
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
        <ToolCompatibilityChecker allResources={allResources} />
      </section>
    );
  }

  if (mode === 'visual') {
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
        <VisualToolSelector allResources={allResources} />
      </section>
    );
  }

  return (
    <section className="text-center py-12 bg-[var(--bg-primary)]">
      <h2 className="text-3xl font-bold mb-4">Start exploring</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        Choose how you'd like to discover tools and resources for your sustainable innovation journey.
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
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

        {/* Timeline View Option */}
        <button
          onClick={() => setMode('timeline')}
          className="group p-8 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left bg-[var(--bg-secondary)]"
        >
          <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
            View by stage
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Explore tools organized by innovation process stages, from ideation through implementation. 
            See where each tool fits in your innovation journey.
          </p>
          <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium">
            View timeline →
          </div>
        </button>

        {/* Network Graph Option */}
        <button
          onClick={() => setMode('network')}
          className="group p-8 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left bg-[var(--bg-secondary)]"
        >
          <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
            Network graph
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Visualize how tools are connected through shared tags and relationships. 
            Explore the network of interconnected resources and discover unexpected connections.
          </p>
          <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium">
            View network →
          </div>
        </button>

        {/* Workflow Builder Option */}
        <button
          onClick={() => setMode('workflows')}
          className="group p-8 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left bg-[var(--bg-secondary)] hover-lift"
        >
          <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
            Build workflows
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Create step-by-step workflows combining multiple tools. Design custom processes 
            for your sustainability projects and save them for future use.
          </p>
          <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium">
            Create workflow →
          </div>
        </button>

        {/* Compatibility Checker Option */}
        <button
          onClick={() => setMode('compatibility')}
          className="group p-8 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left bg-[var(--bg-secondary)] hover-lift"
        >
          <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
            Check compatibility
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            See which tools work well together, identify complementary tools, and get warnings 
            about potential conflicts or overlaps in your tool selection.
          </p>
          <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium">
            Check compatibility →
          </div>
        </button>

        {/* Visual Tool Selector Option */}
        <button
          onClick={() => setMode('visual')}
          className="group p-8 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left bg-[var(--bg-secondary)] hover-lift"
        >
          <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
            Visual tool selector
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Interactive decision tree with visual filters. Answer questions about your goal, 
            audience, and timeline, then refine with sliders and toggles.
          </p>
          <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium">
            Start selecting →
          </div>
        </button>
      </div>
    </section>
  );
}

