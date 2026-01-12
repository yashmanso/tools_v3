'use client';

import { useState } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { QuickFiltersSidebar, FilterState } from './QuickFiltersSidebar';
import { FilteredResourceList } from './FilteredResourceList';
import { FilterButton } from './FilterButton';

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
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedTags: new Set(),
    selectedCategories: new Set(),
    selectedObjectives: new Set(),
    selectedStages: new Set(),
    selectedAudiences: new Set(),
  });

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
            resources={resources}
            onFiltersChange={setFilters}
            initialFilters={filters}
            isOpen={isFiltersOpen}
            onClose={() => setIsFiltersOpen(false)}
          />
        )}

        {/* Main content */}
        <div className={`flex-1 transition-all duration-300 ${isFiltersOpen ? '' : ''}`}>
          <FilteredResourceList
            resources={resources}
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
