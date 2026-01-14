'use client';

import { useState, useMemo, useEffect } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { QuickFiltersSidebar, FilterState } from './QuickFiltersSidebar';
import { FilteredResourceList } from './FilteredResourceList';
import { FilterButton } from './FilterButton';
import { getWelcomeAnswers, reorderResourcesByWelcomeAnswers } from '../lib/welcomeAnswers';

interface FilteredPageLayoutProps {
  resources: ResourceMetadata[];
  allResources: ResourceMetadata[];
  onToolSelect?: (tool: ResourceMetadata) => void;
  selectedTools?: ResourceMetadata[];
}

export function FilteredPageLayout({
  resources,
  allResources,
  onToolSelect,
  selectedTools = [],
}: FilteredPageLayoutProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [welcomeAnswers, setWelcomeAnswers] = useState(getWelcomeAnswers());
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedTags: new Set(),
    selectedCategories: new Set(),
    selectedObjectives: new Set(),
    selectedStages: new Set(),
    selectedAudiences: new Set(),
  });

  // Reorder resources based on welcome answers
  const reorderedResources = useMemo(() => {
    if (Object.keys(welcomeAnswers).length === 0) {
      return resources;
    }
    return reorderResourcesByWelcomeAnswers(resources, welcomeAnswers);
  }, [resources, welcomeAnswers]);

  // Update welcome answers when they change
  useEffect(() => {
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

  const activeFilterCount = filters.selectedTags.size + (filters.searchQuery.length > 0 ? 1 : 0);

  return (
    <div>
      {/* Filter Button */}
      <div className="mb-4 flex items-center justify-between">
        <div></div>
        <FilterButton
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          isActive={isFiltersOpen}
          activeFilterCount={activeFilterCount}
        />
      </div>

      {/* Content with sidebar */}
      <div className="flex gap-6">
        {/* Sidebar */}
        {isFiltersOpen && (
          <QuickFiltersSidebar
            resources={reorderedResources}
            onFiltersChange={setFilters}
            initialFilters={filters}
            isOpen={isFiltersOpen}
            onClose={() => setIsFiltersOpen(false)}
          />
        )}

        {/* Main content */}
        <div className={`flex-1 transition-all duration-300 ${isFiltersOpen ? '' : ''}`}>
          <FilteredResourceList
            resources={reorderedResources}
            allResources={allResources}
            filters={filters}
            onToolSelect={onToolSelect}
            selectedTools={selectedTools}
          />
        </div>
      </div>
    </div>
  );
}
