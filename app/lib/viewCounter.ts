import { ResourceMetadata } from './markdown';

export interface ViewCount {
  category: string;
  slug: string;
  count: number;
}

/**
 * Get all view counts from the server
 */
export async function getViewCounts(): Promise<Record<string, number>> {
  try {
    const response = await fetch('/api/view-count', {
      method: 'GET',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      console.error('Failed to fetch view counts:', response.statusText);
      return {};
    }
    
    const data = await response.json();
    return data.counts || {};
  } catch (error) {
    console.error('Error fetching view counts:', error);
    return {};
  }
}

/**
 * Get view count for a specific resource
 */
export async function getViewCount(resource: ResourceMetadata): Promise<number> {
  const counts = await getViewCounts();
  const key = `${resource.category}/${resource.slug}`;
  return counts[key] || 0;
}

/**
 * Increment view count for a resource
 */
export async function incrementViewCount(resource: ResourceMetadata): Promise<void> {
  try {
    const response = await fetch('/api/view-count', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: resource.category,
        slug: resource.slug,
      }),
    });
    
    if (!response.ok) {
      console.error('Failed to increment view count:', response.statusText);
    } else {
      // Dispatch event to notify components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('view-counts-changed'));
      }
    }
  } catch (error) {
    console.error('Error incrementing view count:', error);
  }
}

/**
 * Get most viewed resources
 */
export async function getMostViewedResources(
  allResources: ResourceMetadata[],
  limit: number = 3
): Promise<ResourceMetadata[]> {
  const counts = await getViewCounts();
  
  // Create array of resources with their view counts
  const resourcesWithCounts = allResources
    .filter(resource => resource.category === 'tools') // Only tools
    .map(resource => ({
      resource,
      count: counts[`${resource.category}/${resource.slug}`] || 0,
    }))
    .filter(item => item.count > 0) // Only include resources that have been viewed
    .sort((a, b) => b.count - a.count) // Sort by count descending
    .slice(0, limit) // Take top N
    .map(item => item.resource);
  
  return resourcesWithCounts;
}

/**
 * Clear all view counts (useful for testing)
 * Note: This would need to be implemented as an API endpoint if needed
 */
export async function clearViewCounts(): Promise<void> {
  console.warn('clearViewCounts is not implemented for server-side storage');
}
