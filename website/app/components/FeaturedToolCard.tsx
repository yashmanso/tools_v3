'use client';

import { ResourceMetadata } from '../lib/markdown';
import { CardLink } from './CardLink';
import { ClickableTag } from './ClickableTag';

interface FeaturedToolCardProps {
  tool: ResourceMetadata;
  allResources: ResourceMetadata[];
}

export function FeaturedToolCard({ tool, allResources }: FeaturedToolCardProps) {
  return (
    <CardLink
      href={`/${tool.category}/${tool.slug}`}
      className="p-4"
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
    </CardLink>
  );
}

