import { ResourceMetadata } from './markdown';

export interface RecentView {
  category: string;
  slug: string;
  title: string;
  viewedAt: number;
}

const LOCAL_STORAGE_KEY = 'sustainability-atlas-recent-views';
const MAX_RECENT_VIEWS = 10;

/**
 * Get recently viewed resources from local storage
 */
export function getRecentViews(): RecentView[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error('Error reading recent views from local storage:', error);
    return [];
  }
}

/**
 * Add a resource to recently viewed
 */
export function addRecentView(resource: ResourceMetadata) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    const recentViews = getRecentViews();
    
    // Remove if already exists
    const filtered = recentViews.filter(
      (view) => !(view.slug === resource.slug && view.category === resource.category)
    );
    
    // Add to beginning
    const newView: RecentView = {
      category: resource.category,
      slug: resource.slug,
      title: resource.title,
      viewedAt: Date.now(),
    };
    
    const updated = [newView, ...filtered].slice(0, MAX_RECENT_VIEWS);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    
    // Dispatch event to notify components
    window.dispatchEvent(new Event('recent-views-changed'));
  } catch (error) {
    console.error('Error saving recent view to local storage:', error);
  }
}

/**
 * Clear all recent views
 */
export function clearRecentViews() {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    window.dispatchEvent(new Event('recent-views-changed'));
  } catch (error) {
    console.error('Error clearing recent views:', error);
  }
}

/**
 * Get recent views as ResourceMetadata objects
 */
export function getRecentViewsAsResources(allResources: ResourceMetadata[]): ResourceMetadata[] {
  const recentViews = getRecentViews();
  const recentMap = new Map<string, RecentView>();
  
  recentViews.forEach(view => {
    recentMap.set(`${view.category}/${view.slug}`, view);
  });
  
  return allResources
    .filter(resource => recentMap.has(`${resource.category}/${resource.slug}`))
    .sort((a, b) => {
      const viewA = recentViews.find(v => v.slug === a.slug && v.category === a.category);
      const viewB = recentViews.find(v => v.slug === b.slug && v.category === b.category);
      return (viewB?.viewedAt || 0) - (viewA?.viewedAt || 0);
    });
}
