'use client';

import { useState, useEffect, useRef } from 'react';
import { TagList } from './TagList';
import { RelatedPages } from './RelatedPages';
import { ContentWithHoverPreviews } from './ContentWithHoverPreviews';
import { ToolCompatibility } from './ToolCompatibility';
import { ToolPrerequisites } from './ToolPrerequisites';
import { usePanels } from './PanelContext';
import type { ResourceMetadata } from '../lib/markdown';

interface ResourcePanelContentProps {
  path: string;
}

interface ResourceData {
  resource: {
    title: string;
    slug: string;
    category: string;
    tags: string[];
    contentHtml: string;
    overview?: string;
    compatibleTools?: string[];
    prerequisites?: string[];
  };
  relatedPages: Array<{
    slug: string;
    title: string;
    category: string;
    tags: string[];
    overview?: string;
    score?: number;
  }>;
  allResources: Array<{
    title: string;
    slug: string;
    category: string;
    tags: string[];
    overview?: string;
  }>;
}

export function ResourcePanelContent({ path }: ResourcePanelContentProps) {
  const [data, setData] = useState<ResourceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { addPanel } = usePanels();

  useEffect(() => {
    async function fetchResource() {
      try {
        setLoading(true);
        const response = await fetch(`/api/resource?path=${encodeURIComponent(path)}`);
        
        if (!response.ok) {
          throw new Error('Resource not found');
        }

        const resourceData = await response.json();
        setData(resourceData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load resource');
        setLoading(false);
      }
    }

    fetchResource();
  }, [path]);

  // Handle link clicks within the content to open in new panels
  useEffect(() => {
    if (!contentRef.current || !data) return;

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href) return;

      // Skip external links and anchor links
      if (href.startsWith('http') || href.startsWith('#')) {
        return;
      }

      e.preventDefault();

      // Open in new panel
      addPanel({
        id: `${href}-${Date.now()}`,
        title: href.split('/').pop() || href,
        path: href,
        content: <ResourcePanelContent path={href} />,
      });
    };

    contentRef.current.addEventListener('click', handleLinkClick);
    return () => {
      contentRef.current?.removeEventListener('click', handleLinkClick);
    };
  }, [data, addPanel]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-[var(--text-secondary)]">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-sm text-red-500">{error || 'Failed to load resource'}</div>
      </div>
    );
  }

  const { resource, relatedPages, allResources } = data;
  
  // Convert to ResourceMetadata format for components that need it
  const resourceMetadata: ResourceMetadata = {
    title: resource.title,
    slug: resource.slug,
    category: resource.category,
    tags: resource.tags,
    contentHtml: resource.contentHtml,
    overview: resource.overview,
    compatibleTools: resource.compatibleTools,
    prerequisites: resource.prerequisites,
  };

  const allResourcesMetadata: ResourceMetadata[] = allResources.map(r => ({
    title: r.title,
    slug: r.slug,
    category: r.category,
    tags: r.tags,
    overview: r.overview,
    contentHtml: '',
  }));

  return (
    <div ref={contentRef}>
      <article className="max-w-4xl mx-auto">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {resource.title}
        </h1>

        {/* Tags - This is now a proper React component with working onClick handlers */}
        <TagList 
          tags={resource.tags} 
          allResources={allResourcesMetadata} 
          resourceTitle={resource.title} 
        />

        {/* Content */}
        <ContentWithHoverPreviews
          html={resource.contentHtml}
          className="prose prose-gray dark:prose-invert max-w-none
            prose-headings:font-bold
            prose-h1:text-3xl prose-h1:mb-4
            prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-8 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700
            prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-6
            prose-p:mb-4 prose-p:leading-relaxed
            prose-ul:mb-4 prose-ul:ml-6
            prose-li:mb-2
            prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:font-semibold
            prose-img:rounded-3xl prose-img:shadow-md"
        />

        {/* Tool Prerequisites (only for tools) */}
        {resource.category === 'tools' && (
          <ToolPrerequisites tool={resourceMetadata} allResources={allResourcesMetadata} />
        )}

        {/* Tool Compatibility (only for tools) */}
        {resource.category === 'tools' && (
          <ToolCompatibility currentTool={resourceMetadata} allResources={allResourcesMetadata} />
        )}

        {/* Related Pages */}
        <RelatedPages pages={relatedPages} currentCategory={resource.category} />
      </article>
    </div>
  );
}
