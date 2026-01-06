'use client';

import { ResourceMetadata } from '../lib/markdown';
import { PanelLink } from './PanelLink';
import { ClickableTag } from './ClickableTag';

interface ResourceCardProps {
  resource: ResourceMetadata;
  allResources: ResourceMetadata[];
}

export function ResourceCard({ resource, allResources }: ResourceCardProps) {

  return (
    <PanelLink
      href={`/${resource.category}/${resource.slug}`}
      className="block p-5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md hover:no-underline"
    >
      <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
        {resource.title}
      </h3>

      <div className="flex flex-wrap gap-1 mt-3">
        {resource.tags.slice(0, 5).map((tag) => (
          <ClickableTag
            key={tag}
            tag={tag}
            allResources={allResources}
            size="xs"
          />
        ))}
        {resource.tags.length > 5 && (
          <span className="text-xs px-2 py-1 text-gray-500">
            +{resource.tags.length - 5} more
          </span>
        )}
      </div>
    </PanelLink>
  );
}
