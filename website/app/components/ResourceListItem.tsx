'use client';

import { ResourceMetadata } from '../lib/markdown';
import { PanelLink } from './PanelLink';
import { ClickableTag } from './ClickableTag';
import { BookmarkButton } from './BookmarkButton';
import { ProgressiveDisclosure } from './ProgressiveDisclosure';
import { ScrollAnimation } from './ScrollAnimation';

interface ResourceListItemProps {
  resource: ResourceMetadata;
  allResources: ResourceMetadata[];
  animationDelay?: number;
}

export function ResourceListItem({ resource, allResources, animationDelay = 0 }: ResourceListItemProps) {
  return (
    <ScrollAnimation delay={animationDelay} direction="slide-up">
      <div className="relative group">
        <PanelLink
        href={`/${resource.category}/${resource.slug}`}
        className="block p-5 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-md hover:no-underline"
      >
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              {resource.title}
            </h3>
            {resource.overview && (
              <ProgressiveDisclosure
                summary={resource.overview}
                details={resource.overview}
                summaryLength={200}
                className="mb-3"
              />
            )}
            <div className="flex flex-wrap gap-1">
              {resource.tags.slice(0, 8).map((tag) => (
                <ClickableTag
                  key={tag}
                  tag={tag}
                  allResources={allResources}
                  size="xs"
                />
              ))}
              {resource.tags.length > 8 && (
                <span className="text-xs px-2 py-1 text-gray-500">
                  +{resource.tags.length - 8} more
                </span>
              )}
            </div>
          </div>
        </div>
      </PanelLink>
      
        {/* Bookmark button */}
        <div className="absolute top-3 right-3 z-10">
          <BookmarkButton resource={resource} size="sm" />
        </div>
      </div>
    </ScrollAnimation>
  );
}
