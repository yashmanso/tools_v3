'use client';

import { ResourceMetadata } from '../lib/markdown';
import { CardLink } from './CardLink';
import { ClickableTag } from './ClickableTag';
import { BookmarkButton } from './BookmarkButton';
import { ProgressiveDisclosure } from './ProgressiveDisclosure';
import { ScrollAnimation } from './ScrollAnimation';
import { formatCardOverview } from '../lib/markdownLinks';

interface ResourceListItemProps {
  resource: ResourceMetadata;
  allResources: ResourceMetadata[];
  animationDelay?: number;
}

export function ResourceListItem({ resource, allResources, animationDelay = 0 }: ResourceListItemProps) {
  return (
    <ScrollAnimation delay={animationDelay} direction="slide-up">
      <div className="relative group">
        <CardLink
        href={`/${resource.category}/${resource.slug}`}
        className="p-5 pt-12"
      >
        {/* Button ribbon area */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
          <BookmarkButton resource={resource} size="sm" />
        </div>
        
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">
              {resource.title}
            </h3>
            {resource.overview && (
              <ProgressiveDisclosure
                summary={formatCardOverview(resource.overview)}
                details={formatCardOverview(resource.overview)}
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
      </CardLink>
      </div>
    </ScrollAnimation>
  );
}
