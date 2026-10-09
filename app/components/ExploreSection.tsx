'use client';

import { useRef, useState, useEffect, useCallback, type ReactElement } from 'react';
import Link from 'next/link';
import type { ResourceMetadata } from '../lib/markdown';
import { ToolFinder } from './ToolFinder';
import { CompareTools } from './CompareTools';
import { TimelineView } from './TimelineView';
import { NetworkGraph } from './NetworkGraph';
import { WorkflowBuilder } from './WorkflowBuilder';
import { ToolCompatibilityChecker } from './ToolCompatibilityChecker';
import { VisualToolSelector } from './VisualToolSelector';
import { Button } from '@/components/ui/button';
import { CardButton } from './CardButton';
import { cn } from '@/lib/utils';
import { usePanels } from './PanelContext';
import { useWorkflowMenu } from './WorkflowMenuContext';

interface ExploreSectionProps {
  allResources: ResourceMetadata[];
  graphData?: {
    nodes: Array<{ id: string; node: { slug: string; title: string; category: string; tags: string[] } }>;
    edges: Array<{ source: string; target: string; weight: number; reasons: string[] }>;
  };
}

export function ExploreSection({ allResources, graphData }: ExploreSectionProps) {
  const [mode, setMode] = useState<'select' | 'browse' | 'find' | 'compare' | 'timeline' | 'network' | 'workflows' | 'compatibility' | 'visual'>('select');
  const contentRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);
  const { panels } = usePanels();
  const hasPanelsOpen = panels.length > 0;
  const { open: menuOpen, closeMenu, setAvailable, overviewRequest } = useWorkflowMenu();

  // Tell the header the menu's contents exist on this page.
  useEffect(() => {
    setAvailable(true);
    return () => setAvailable(false);
  }, [setAvailable]);

  // The tour returns the section here when it ends.
  useEffect(() => {
    if (overviewRequest > 0) setMode('select');
  }, [overviewRequest]);

  const items: {
    id: typeof mode;
    label: string;
    description: string;
  }[] = [
    {
      id: 'select',
      label: 'Overview',
      description: 'See all the different ways you can start exploring.',
    },
    {
      id: 'browse',
      label: 'Browse & explore',
      description: 'Explore the full collection by category, tags, and keywords.',
    },
    {
      id: 'find',
      label: 'Find your tool',
      description: 'Answer questions to get tailored tool recommendations.',
    },
    {
      id: 'compare',
      label: 'Compare tools',
      description: 'Look at tools side by side across key dimensions.',
    },
    {
      id: 'timeline',
      label: 'View by stage',
      description: 'See which tools support each stage of your journey.',
    },
    {
      id: 'network',
      label: 'Network graph',
      description: 'Visualize connections and related tools.',
    },
    {
      id: 'workflows',
      label: 'Build workflows',
      description: 'Combine tools into reusable step‑by‑step workflows.',
    },
    {
      id: 'compatibility',
      label: 'Check compatibility',
      description: 'Identify complementary tools and overlapping ones.',
    },
    {
      id: 'visual',
      label: 'Visual tool selector',
      description: 'Use a visual decision tree to narrow down options.',
    },
  ];


  const handleSelectMode = (id: typeof mode) => {
    setMode(id);
    // Smoothly scroll the main ExploreSection content into view
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  let content: ReactElement | null = null;

  if (mode === 'browse') {
    content = (
      <div className="py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setMode('select')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-flex items-center gap-2"
          >
            ← Back to options
          </Button>
          <h2 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">Browse our collection</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
            Explore our comprehensive collection of tools, methods, frameworks, and resources.
            Filter by category, search by keywords, or browse by tags to discover what interests you.
          </p>
        </div>
        <div data-tour="browse-links" className="flex flex-wrap gap-4 justify-center">
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
      </div>
    );
  } else if (mode === 'find') {
    content = (
      <div className="py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setMode('select')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-flex items-center gap-2"
          >
            ← Back to options
          </Button>
        </div>
        <ToolFinder allResources={allResources} />
      </div>
    );
  } else if (mode === 'compare') {
    content = (
      <div className="py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setMode('select')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-flex items-center gap-2"
          >
            ← Back to options
          </Button>
        </div>
        <CompareTools allResources={allResources} />
      </div>
    );
  } else if (mode === 'timeline') {
    content = (
      <div className="py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setMode('select')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-flex items-center gap-2"
          >
            ← Back to options
          </Button>
        </div>
        <TimelineView allResources={allResources} />
      </div>
    );
  } else if (mode === 'network') {
    content = (
      <div className="py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setMode('select')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-flex items-center gap-2"
          >
            ← Back to options
          </Button>
        </div>
        {graphData ? (
          <NetworkGraph allResources={allResources} graphData={graphData} />
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Loading network graph...
          </div>
        )}
      </div>
    );
  } else if (mode === 'workflows') {
    content = (
      <div className="py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setMode('select')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-flex items-center gap-2"
          >
            ← Back to options
          </Button>
        </div>
        <WorkflowBuilder allResources={allResources} />
      </div>
    );
  } else if (mode === 'compatibility') {
    content = (
      <div className="py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setMode('select')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-flex items-center gap-2"
          >
            ← Back to options
          </Button>
        </div>
        <ToolCompatibilityChecker allResources={allResources} />
      </div>
    );
  } else if (mode === 'visual') {
    content = (
      <div className="py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setMode('select')}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 inline-flex items-center gap-2"
          >
            ← Back to options
          </Button>
        </div>
        <VisualToolSelector allResources={allResources} />
      </div>
    );
  }

  /* The workflow menu, shown as a popup from the header button. */
  const menuPopup = menuOpen ? (
    <div
      className="fixed inset-0 z-[150] flex items-start justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Workflow menu"
    >
      <div className="absolute inset-0 bg-black/50" onClick={closeMenu} />
      <div
        data-tour="workflow-menu"
        className="relative mt-[4.5rem] w-full max-w-md max-h-[55vh] overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Workflow menu
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMenu}
            aria-label="Close menu"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </Button>
        </div>
        <div className="space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              data-tour={`menu-item-${item.id}`}
              onClick={() => {
                handleSelectMode(item.id);
                closeMenu();
              }}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-left transition-colors',
                'hover:bg-muted hover:text-foreground',
                mode === item.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground'
              )}
            >
              <div className="font-medium text-[0.85rem]">{item.label}</div>
              <div className="mt-0.5 text-[0.72rem] text-muted-foreground/80">
                {item.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <section ref={sectionRef} className="pb-12 bg-[var(--bg-primary)]">
      {menuPopup}

      <div
        className={cn(
          'px-4 sm:px-6 lg:px-8',
          hasPanelsOpen ? 'max-w-6xl mx-auto' : 'max-w-4xl mx-auto'
        )}
      >
        <div ref={contentRef} className="mt-6 lg:mt-0">
          {mode === 'select' ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Start exploring</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Choose how you'd like to discover tools and resources for your sustainable innovation journey.
              </p>

              <div data-tour="explore-hub" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Browse Option */}
                <CardButton onClick={() => setMode('browse')} className="group p-4 sm:p-6 lg:p-8 min-h-[200px] sm:min-h-[240px]">
                  <div className="flex w-full flex-col h-full">
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-[var(--text-primary)]">
                      Browse & explore
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                      Explore our full collection at your own pace. Browse by category, search by keywords,
                      or filter by tags. Perfect for discovering what's available and getting inspired.
                    </p>
                    <div className="mt-auto pt-4 text-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                      Start browsing →
                    </div>
                  </div>
                </CardButton>

                {/* Find Tool Option */}
                <CardButton onClick={() => setMode('find')} className="group p-4 sm:p-6 lg:p-8 min-h-[200px] sm:min-h-[240px]">
                  <div className="flex w-full flex-col h-full">
                    <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
                      Find your tool
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                      Answer a few quick questions about your needs, context, and goals.
                      We'll recommend the most relevant tools tailored to your specific situation.
                    </p>
                    <div className="mt-auto pt-4 text-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                      Start questionnaire →
                    </div>
                  </div>
                </CardButton>

                {/* Compare Tools Option */}
                <CardButton onClick={() => setMode('compare')} className="group p-4 sm:p-6 lg:p-8 min-h-[200px] sm:min-h-[240px]">
                  <div className="flex w-full flex-col h-full">
                    <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
                      Compare tools
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                      Select up to 3 tools and see how they differ across dimensions, features, and use cases.
                      Perfect for choosing the right tool for your needs.
                    </p>
                    <div className="mt-auto pt-4 text-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                      Start comparing →
                    </div>
                  </div>
                </CardButton>

                {/* Timeline View Option */}
                <CardButton onClick={() => setMode('timeline')} className="group p-4 sm:p-6 lg:p-8 min-h-[200px] sm:min-h-[240px]">
                  <div className="flex w-full flex-col h-full">
                    <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
                      View by stage
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                      Explore tools organized by innovation process stages, from ideation through implementation.
                      See where each tool fits in your innovation journey.
                    </p>
                    <div className="mt-auto pt-4 text-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                      View timeline →
                    </div>
                  </div>
                </CardButton>

                {/* Network Graph Option */}
                <CardButton onClick={() => setMode('network')} className="group p-4 sm:p-6 lg:p-8 min-h-[200px] sm:min-h-[240px]">
                  <div className="flex w-full flex-col h-full">
                    <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
                      Network graph
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                      Visualize how tools are connected through shared tags and relationships.
                      Explore the network of interconnected resources and discover unexpected connections.
                    </p>
                    <div className="mt-auto pt-4 text-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                      View network →
                    </div>
                  </div>
                </CardButton>

                {/* Workflow Builder Option */}
                <CardButton data-tour="mode-workflows" onClick={() => setMode('workflows')} className="group p-4 sm:p-6 lg:p-8 min-h-[200px] sm:min-h-[240px]">
                  <div className="flex w-full flex-col h-full">
                    <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
                      Build workflows
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                      Create step-by-step workflows combining multiple tools. Design custom processes
                      for your sustainability projects and save them for future use.
                    </p>
                    <div className="mt-auto pt-4 text-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                      Create workflow →
                    </div>
                  </div>
                </CardButton>

                {/* Compatibility Checker Option */}
                <CardButton onClick={() => setMode('compatibility')} className="group p-4 sm:p-6 lg:p-8 min-h-[200px] sm:min-h-[240px]">
                  <div className="flex w-full flex-col h-full">
                    <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
                      Check compatibility
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                      See which tools work well together, identify complementary tools, and spot
                      overlaps where two tools in your selection do much the same job.
                    </p>
                    <div className="mt-auto pt-4 text-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                      Check compatibility →
                    </div>
                  </div>
                </CardButton>

                {/* Visual Tool Selector Option */}
                <CardButton onClick={() => setMode('visual')} className="group p-4 sm:p-6 lg:p-8 min-h-[200px] sm:min-h-[240px]">
                  <div className="flex w-full flex-col h-full">
                    <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
                      Visual tool selector
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed break-words">
                      Interactive decision tree with visual filters. Answer questions about your goal,
                      audience, and timeline, then refine with sliders and toggles.
                    </p>
                    <div className="mt-auto pt-4 text-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                      Start selecting →
                    </div>
                  </div>
                </CardButton>
              </div>
            </div>
          ) : (
            content
          )}
        </div>
      </div>
    </section>
  );
}

