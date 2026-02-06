'use client';

import { useState, useMemo, useEffect } from 'react';
import type { ResourceMetadata } from '../lib/markdown';
import { Button } from '@/components/ui/button';

export interface FilterState {
  searchQuery: string;
  selectedTags: Set<string>;
  selectedCategories: Set<string>;
  selectedObjectives: Set<string>;
  selectedStages: Set<string>;
  selectedAudiences: Set<string>;
}

// Tag categories based on the tag glossary
const TAG_CATEGORIES = {
  objectives: ['map', 'assess', 'report', 'align'],
  stages: ['ideation', 'design', 'development', 'implementation', 'startup', 'growth', 'scale-up', 'maturity'],
  audiences: ['entrepreneurs', 'researchers', 'students', 'educators', 'practitioners', 'startups', 'SMEs', 'corporations'],
  sustainability: ['environmental-sustainability', 'social-sustainability', 'economic-sustainability', 'circular-economy', 'SDGs'],
  innovation: ['product-innovation', 'process-innovation', 'business-model-innovation', 'social-innovation'],
  resourceTypes: ['framework', 'canvas', 'toolkit', 'method', 'tool', 'template', 'academic-articles', 'book'],
};

interface QuickFiltersSidebarProps {
  resources: ResourceMetadata[];
  onFiltersChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  isOpen: boolean;
  onClose: () => void;
}

export function QuickFiltersSidebar({ resources, onFiltersChange, initialFilters, isOpen, onClose }: QuickFiltersSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters || {
    searchQuery: '',
    selectedTags: new Set(),
    selectedCategories: new Set(),
    selectedObjectives: new Set(),
    selectedStages: new Set(),
    selectedAudiences: new Set(),
  });

  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['objectives', 'stages']));

  // Get all available tags organized by category
  const tagsByCategory = useMemo(() => {
    const allTags = new Set<string>();
    resources.forEach(r => r.tags.forEach(tag => allTags.add(tag)));

    const organized: Record<string, string[]> = {
      objectives: [],
      stages: [],
      audiences: [],
      sustainability: [],
      innovation: [],
      resourceTypes: [],
      other: [],
    };

    allTags.forEach(tag => {
      let categorized = false;
      for (const [category, tags] of Object.entries(TAG_CATEGORIES)) {
        if (tags.includes(tag)) {
          organized[category].push(tag);
          categorized = true;
          break;
        }
      }
      if (!categorized) {
        organized.other.push(tag);
      }
    });

    // Sort each category
    Object.keys(organized).forEach(key => {
      organized[key].sort();
    });

    return organized;
  }, [resources]);

  // Update parent when filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const toggleTag = (tag: string) => {
    setFilters(prev => {
      const newTags = new Set(prev.selectedTags);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return { ...prev, selectedTags: newTags };
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedTags: new Set(),
      selectedCategories: new Set(),
      selectedObjectives: new Set(),
      selectedStages: new Set(),
      selectedAudiences: new Set(),
    });
  };

  const hasActiveFilters = filters.selectedTags.size > 0 || filters.searchQuery.length > 0;

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      objectives: 'Objectives',
      stages: 'Entrepreneurship stage',
      audiences: 'Target audience',
      sustainability: 'Sustainability focus',
      innovation: 'Innovation type',
      resourceTypes: 'Resource type',
      other: 'Other tags',
    };
    return labels[category] || category;
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 flex-shrink-0 bg-[var(--bg-secondary)] border-r border-gray-200 dark:border-gray-700 h-[calc(100vh-200px)] overflow-hidden flex flex-col">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h2>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="ghost"
                  onClick={clearFilters}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear
                </Button>
              )}
              <Button variant="ghost"
                onClick={onClose}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                aria-label="Close filters"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full px-3 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Sections */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {Object.entries(tagsByCategory).map(([category, tags]) => {
              if (tags.length === 0) return null;

              const isExpanded = expandedSections.has(category);
              const selectedCount = tags.filter(tag => filters.selectedTags.has(tag)).length;

              return (
                <div key={category} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                  <Button variant="ghost"
                    onClick={() => toggleSection(category)}
                    className="w-full flex items-center justify-between mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      {getCategoryLabel(category)}
                      {selectedCount > 0 && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                          {selectedCount}
                        </span>
                      )}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>

                  {isExpanded && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag) => {
                        const isSelected = filters.selectedTags.has(tag);
                        return (
                          <Button variant="ghost"
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            {tag.replace(/-/g, ' ')}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer with active filter count */}
          {hasActiveFilters && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {filters.selectedTags.size} filter{filters.selectedTags.size !== 1 ? 's' : ''} active
              </div>
            </div>
          )}
        </div>
      </div>
  );
}
