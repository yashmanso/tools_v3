'use client';

import { useEffect, useState } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { getMostViewedResources } from '../lib/viewCounter';
import { CardLink } from './CardLink';
import { ScrollAnimation } from './ScrollAnimation';
import { formatCardOverview } from '../lib/markdownLinks';

interface MostViewedToolsProps {
  allResources: ResourceMetadata[];
}

export function MostViewedTools({ allResources }: MostViewedToolsProps) {
  const [mostViewed, setMostViewed] = useState<ResourceMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get most viewed tools from server
    const fetchMostViewed = async () => {
      setLoading(true);
      try {
        const viewed = await getMostViewedResources(allResources, 3);
        setMostViewed(viewed);
      } catch (error) {
        console.error('Error fetching most viewed tools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMostViewed();

    // Listen for view count changes
    const handleViewCountsChanged = async () => {
      try {
        const updated = await getMostViewedResources(allResources, 3);
        setMostViewed(updated);
      } catch (error) {
        console.error('Error updating most viewed tools:', error);
      }
    };

    window.addEventListener('view-counts-changed', handleViewCountsChanged);
    return () => {
      window.removeEventListener('view-counts-changed', handleViewCountsChanged);
    };
  }, [allResources]);

  // Don't render if loading or there are no viewed tools yet
  if (loading || mostViewed.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <ScrollAnimation direction="fade" delay={0}>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 text-center">
            Most viewed tools
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Discover the tools our community is exploring most
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {mostViewed.map((tool, index) => (
            <ScrollAnimation key={`${tool.category}/${tool.slug}`} direction="slide-up" delay={index * 100}>
              <CardLink
                href={`/${tool.category}/${tool.slug}`}
                className="p-6 h-full flex flex-col"
              >
                <h3 className="text-lg font-semibold mb-2 text-[var(--text-primary)] line-clamp-2">
                  {tool.title}
                </h3>
                {tool.overview && (
                  <p className="text-sm text-[var(--text-secondary)] line-clamp-3 flex-grow">
                    {formatCardOverview(tool.overview)}
                  </p>
                )}
                <div className="mt-4 text-blue-600 dark:text-blue-400 text-sm font-medium">
                  View tool →
                </div>
              </CardLink>
            </ScrollAnimation>
          ))}
        </div>
      </ScrollAnimation>
    </section>
  );
}
