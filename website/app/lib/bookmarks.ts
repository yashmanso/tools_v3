import { ResourceMetadata } from './markdown';

const BOOKMARKS_STORAGE_KEY = 'sustainability-atlas-bookmarks';

export interface Bookmark {
  category: string;
  slug: string;
  title: string;
  bookmarkedAt: number; // timestamp
}

/**
 * Get all bookmarked resources from localStorage
 */
export function getBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error reading bookmarks from localStorage:', error);
    return [];
  }
}

/**
 * Check if a resource is bookmarked
 */
export function isBookmarked(category: string, slug: string): boolean {
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.category === category && b.slug === slug);
}

/**
 * Add a resource to bookmarks
 */
export function addBookmark(resource: ResourceMetadata): void {
  if (typeof window === 'undefined') return;
  
  const bookmarks = getBookmarks();
  
  // Check if already bookmarked
  if (isBookmarked(resource.category, resource.slug)) {
    return;
  }
  
  const bookmark: Bookmark = {
    category: resource.category,
    slug: resource.slug,
    title: resource.title,
    bookmarkedAt: Date.now(),
  };
  
  bookmarks.push(bookmark);
  
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('bookmarks-changed'));
  } catch (error) {
    console.error('Error saving bookmark to localStorage:', error);
  }
}

/**
 * Remove a resource from bookmarks
 */
export function removeBookmark(category: string, slug: string): void {
  if (typeof window === 'undefined') return;
  
  const bookmarks = getBookmarks();
  const filtered = bookmarks.filter(
    b => !(b.category === category && b.slug === slug)
  );
  
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(filtered));
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent('bookmarks-changed'));
  } catch (error) {
    console.error('Error removing bookmark from localStorage:', error);
  }
}

/**
 * Toggle bookmark status
 */
export function toggleBookmark(resource: ResourceMetadata): void {
  if (isBookmarked(resource.category, resource.slug)) {
    removeBookmark(resource.category, resource.slug);
  } else {
    addBookmark(resource);
  }
}

/**
 * Get bookmarked resources with full metadata
 */
export function getBookmarkedResources(allResources: ResourceMetadata[]): ResourceMetadata[] {
  if (!allResources || !Array.isArray(allResources)) {
    return [];
  }
  
  const bookmarks = getBookmarks();
  const bookmarkedMap = new Map<string, Bookmark>();
  
  bookmarks.forEach(b => {
    bookmarkedMap.set(`${b.category}/${b.slug}`, b);
  });
  
  return allResources.filter(resource => {
    return bookmarkedMap.has(`${resource.category}/${resource.slug}`);
  }).sort((a, b) => {
    const bookmarkA = bookmarks.find(bm => bm.category === a.category && bm.slug === a.slug);
    const bookmarkB = bookmarks.find(bm => bm.category === b.category && bm.slug === b.slug);
    // Sort by most recently bookmarked first
    return (bookmarkB?.bookmarkedAt || 0) - (bookmarkA?.bookmarkedAt || 0);
  });
}
