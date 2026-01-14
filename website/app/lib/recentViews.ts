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
    if (!item) return [];
    
    const parsed = JSON.parse(item);
    
    // Check if data is in old format (array of strings) and clear it
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
      console.warn('Old format detected in recent views (array of strings), clearing...');
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      return [];
    }
    
    // Also check for arrays of objects that don't have the right structure
    if (Array.isArray(parsed) && parsed.length > 0) {
      const firstItem = parsed[0];
      // Check if it's an object but missing required fields
      if (typeof firstItem === 'object' && firstItem !== null) {
        const hasRequiredFields = firstItem.category && firstItem.slug && firstItem.title;
        if (!hasRequiredFields) {
          console.warn('Invalid format detected in recent views (missing required fields), clearing...', firstItem);
          localStorage.removeItem(LOCAL_STORAGE_KEY);
          return [];
        }
      }
    }
    
    // Validate that items have the correct structure
    if (Array.isArray(parsed)) {
      const valid = parsed.filter((view: any) => 
        view && 
        typeof view === 'object' && 
        view.category && 
        view.slug && 
        view.title &&
        typeof view.category === 'string' &&
        typeof view.slug === 'string' &&
        typeof view.title === 'string'
      );
      
      if (valid.length !== parsed.length) {
        console.warn(`Filtered out ${parsed.length - valid.length} invalid recent view entries`);
      }
      
      return valid;
    }
    
    return [];
  } catch (error) {
    console.error('Error reading recent views from local storage:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
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
