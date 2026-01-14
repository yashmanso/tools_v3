'use client';

import { useState, useMemo, useEffect } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { ResourceCard } from './ResourceCard';
import { ResourceListItem } from './ResourceListItem';
import { ViewToggle } from './ViewToggle';
import { FilterState } from './QuickFiltersSidebar';
import { getWelcomeAnswers, scoreResourceByWelcomeAnswers } from '../lib/welcomeAnswers';

interface FilteredResourceListProps {
  resources: ResourceMetadata[];
  allResources: ResourceMetadata[];
  filters: FilterState;
  onToolSelect?: (tool: ResourceMetadata) => void;
  selectedTools?: ResourceMetadata[];
}

export function FilteredResourceList({
  resources,
  allResources,
  filters,
  onToolSelect,
  selectedTools = [],
}: FilteredResourceListProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [welcomeAnswers, setWelcomeAnswers] = useState<ReturnType<typeof getWelcomeAnswers>>({});
  const [isClient, setIsClient] = useState(false);
  
  // Only load welcome answers on client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    setWelcomeAnswers(getWelcomeAnswers());
    
    const handleWelcomeUpdate = () => {
      setWelcomeAnswers(getWelcomeAnswers());
    };
    
    window.addEventListener('welcome-answers-updated', handleWelcomeUpdate);
    window.addEventListener('storage', handleWelcomeUpdate);
    
    return () => {
      window.removeEventListener('welcome-answers-updated', handleWelcomeUpdate);
      window.removeEventListener('storage', handleWelcomeUpdate);
    };
  }, []);
  
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      // Search filter
      const matchesSearch =
        filters.searchQuery === '' ||
        resource.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        resource.overview?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(filters.searchQuery.toLowerCase()));

      // Tag filter (all selected tags must be present)
      const matchesTags =
        filters.selectedTags.size === 0 ||
        Array.from(filters.selectedTags).every((tag) => resource.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [resources, filters]);

  return (
    <div>
      {/* Results count and view toggle */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredResources.length} of {resources.length}{' '}
          {resources.length === 1 ? 'result' : 'results'}
        </div>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Results grid or list */}
      {filteredResources.length > 0 ? (
        view === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource, index) => {
              const isSelected = selectedTools.some(t => t.slug === resource.slug);
              const canSelect = !onToolSelect || selectedTools.length < 3 || isSelected;
              const relevanceScore = isClient ? scoreResourceByWelcomeAnswers(resource, welcomeAnswers) : 0;
              const isRelevant = isClient && relevanceScore > 0;
              
              return (
                <div key={resource.slug} className="relative">
                  {isRelevant && index < 6 && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow-lg z-10">
                      Recommended
                    </div>
                  )}
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
          <div className="space-y-3">
            {filteredResources.map((resource, index) => {
              const isSelected = selectedTools.some(t => t.slug === resource.slug);
              const canSelect = !onToolSelect || selectedTools.length < 3 || isSelected;
              
              return (
                <div key={resource.slug} className="relative">
                  {onToolSelect && (
                    <button
                      onClick={() => onToolSelect(resource)}
                      disabled={!canSelect && !isSelected}
                      className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : canSelect
                          ? 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                      title={isSelected ? 'Remove from comparison' : canSelect ? 'Add to comparison' : 'Maximum 3 tools selected'}
                    >
                      {isSelected ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                    </button>
                  )}
                  <ResourceListItem resource={resource} allResources={allResources} animationDelay={index * 50} />
                </div>
              );
            })}
          </div>
        )
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="mb-2">No resources found matching your filters.</p>
          <p className="text-sm">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
}
