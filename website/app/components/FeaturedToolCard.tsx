'use client';

import { ResourceMetadata } from '../lib/markdown';
import { PanelLink } from './PanelLink';
import { ClickableTag } from './ClickableTag';

interface FeaturedToolCardProps {
  tool: ResourceMetadata;
  allResources: ResourceMetadata[];
}

export function FeaturedToolCard({ tool, allResources }: FeaturedToolCardProps) {
  return (
    <PanelLink
      href={`/${tool.category}/${tool.slug}`}
      className="block p-4 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors hover:no-underline"
    >
      <h3 className="font-semibold mb-2">{tool.title}</h3>
      <div className="mt-2 flex flex-wrap gap-1">
        {tool.tags.slice(0, 3).map((tag) => (
          <ClickableTag
            key={tag}
            tag={tag}
            allResources={allResources}
            size="xs"
          />
        ))}
      </div>
    </PanelLink>
  );
}

