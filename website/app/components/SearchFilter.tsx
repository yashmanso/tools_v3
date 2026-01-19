'use client';

import { useState, useMemo } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { ResourceCard } from './ResourceCard';
import { Button } from '@/components/ui/button';

interface SearchFilterProps {
  resources: ResourceMetadata[];
  allResources: ResourceMetadata[];
  onToolSelect?: (tool: ResourceMetadata) => void;
  selectedTools?: ResourceMetadata[];
}

export function SearchFilter({ resources, allResources, onToolSelect, selectedTools = [] }: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    resources.forEach((resource) => {
      resource.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [resources]);

  // Filter resources based on search and tags
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.overview?.toLowerCase().includes(searchQuery.toLowerCase());

      // Tag filter
      const matchesTags =
        selectedTags.size === 0 ||
        Array.from(selectedTags).every((tag) => resource.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [resources, searchQuery, selectedTags]);

  const toggleTag = (tag: string) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags(new Set());
  };

  return (
    <div>
      <div className="mb-6 space-y-4">
        {/* Search input */}
        <div>
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Popular tags */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Filter by tags:
            </h3>
            {(searchQuery || selectedTags.size > 0) && (
              <Button variant="ghost"
                onClick={clearFilters}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear filters
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.slice(0, 20).map((tag) => (
              <Button variant="ghost"
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs px-3 py-1 rounded-full transition-colors ${
                  selectedTags.has(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredResources.length} of {resources.length}{' '}
        {resources.length === 1 ? 'result' : 'results'}
      </div>

      {/* Results grid */}
      {filteredResources.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredResources.map((resource) => {
            const isSelected = selectedTools.some(t => t.slug === resource.slug);
            const canSelect = !onToolSelect || selectedTools.length < 3 || isSelected;
            
            return (
              <div key={resource.slug} className="relative">
                <ResourceCard 
                  resource={resource} 
                  allResources={allResources} 
                  animationDelay={index * 50}
                  showSelectionButton={!!onToolSelect}
                  isSelected={isSelected}
                  canSelect={canSelect}
                  onSelect={() => onToolSelect?.(resource)}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No resources found matching your filters.
        </div>
      )}
    </div>
  );
}
