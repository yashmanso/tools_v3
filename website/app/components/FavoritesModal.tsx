'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getBookmarkedResources } from '../lib/bookmarks';
import { PanelLink } from './PanelLink';
import type { ResourceMetadata } from '../lib/markdown';

interface FavoritesModalProps {
  allResources: ResourceMetadata[];
  onClose: () => void;
}

import { formatCardOverview } from '../lib/markdownLinks';
import { Button } from '@/components/ui/button';
import { CardLink } from './CardLink';

export function FavoritesModal({ allResources, onClose }: FavoritesModalProps) {
  const [bookmarkedResources, setBookmarkedResources] = useState<ResourceMetadata[]>([]);
  const [selectedTools, setSelectedTools] = useState<ResourceMetadata[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [mounted, setMounted] = useState(false);
  const comparisonGridTemplate = `200px repeat(${selectedTools.length}, minmax(0, 1fr))`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!allResources || allResources.length === 0) {
      return;
    }

    const updateBookmarks = () => {
      const bookmarked = getBookmarkedResources(allResources);
      setBookmarkedResources(bookmarked);
    };

    updateBookmarks();

    // Listen for bookmark changes
    window.addEventListener('bookmarks-changed', updateBookmarks);
    return () => {
      window.removeEventListener('bookmarks-changed', updateBookmarks);
    };
  }, [allResources]);

  // Close on escape key
  useEffect(() => {
    if (!mounted) return;
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showComparison) {
          setShowComparison(false);
          setSelectedTools([]);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose, showComparison, mounted]);

  const handleSelectTool = (tool: ResourceMetadata) => {
    if (selectedTools.find(t => t.slug === tool.slug && t.category === tool.category)) {
      // Remove if already selected
      setSelectedTools(selectedTools.filter(t => !(t.slug === tool.slug && t.category === tool.category)));
    } else if (selectedTools.length < 3) {
      // Add if under limit
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleCompare = () => {
    if (selectedTools.length >= 2) {
      setShowComparison(true);
    }
  };

  const handleResetComparison = () => {
    setShowComparison(false);
    setSelectedTools([]);
  };

  // Get dimension categories from tags
  const getDimensionCategories = (): string[] => {
    return [
      'objective',
      'target-audience',
      'sustainability-focus',
      'innovation-type',
      'entrepreneurship-stage',
      'methodological-approach',
      'skill-development',
      'prerequisites-and-requirements',
      'collaboration-level',
    ];
  };

  // Get tags for a specific dimension
  const getTagsForDimension = (dimension: string, tool: ResourceMetadata): string[] => {
    const dimensionPatterns: Record<string, string[]> = {
      'objective': ['map', 'assess', 'report', 'align'],
      'target-audience': ['entrepreneurs', 'researchers', 'students', 'educators', 'practitioners', 'startups', 'SMEs', 'corporations'],
      'sustainability-focus': ['environmental-sustainability', 'social-sustainability', 'economic-sustainability', 'circular-economy', 'SDGs'],
      'innovation-type': ['product-innovation', 'process-innovation', 'business-model-innovation', 'social-innovation'],
      'entrepreneurship-stage': ['ideation', 'design', 'development', 'implementation', 'startup', 'growth'],
      'methodological-approach': ['theoretical-frameworks', 'experimental-design', 'systems-thinking'],
      'skill-development': ['systems-thinking', 'environmental-awareness', 'innovative-thinking', 'business-and-financial-skills'],
      'prerequisites-and-requirements': ['none', 'beginner-level', 'intermediate-level', 'advanced-level'],
      'collaboration-level': ['individual', 'team', 'community', 'cross-sector-partnerships'],
    };

    const patterns = dimensionPatterns[dimension] || [];
    return tool.tags.filter(tag => patterns.some(pattern => tag.includes(pattern)));
  };

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[150]"
        onClick={onClose}
      />
      {/* Sidebar */}
      <div className={`fixed right-0 top-0 bottom-0 ${showComparison ? 'w-[800px]' : 'w-80'} bg-[var(--bg-secondary)] border-l border-[var(--border)] z-[200] overflow-y-auto shadow-xl flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-[var(--border)] sticky top-0 bg-[var(--bg-secondary)] flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {showComparison ? 'Compare tools' : 'Your favorites'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {showComparison 
                  ? `Comparing ${selectedTools.length} ${selectedTools.length === 1 ? 'tool' : 'tools'}`
                  : `${bookmarkedResources.length} saved ${bookmarkedResources.length === 1 ? 'tool' : 'tools'}`
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              {showComparison ? (
                <Button variant="ghost"
                  onClick={handleResetComparison}
                  className="px-3 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-full hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                >
                  Back
                </Button>
              ) : (
                <>
                  {selectedTools.length >= 2 && (
                    <Button variant="ghost"
                      onClick={handleCompare}
                      className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                    >
                      Compare ({selectedTools.length})
                    </Button>
                  )}
                </>
              )}
              <Button variant="ghost"
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-auto p-4">
          {showComparison && selectedTools.length >= 2 ? (
            /* Comparison View */
            <div className="min-w-full space-y-6">
              <div className="grid gap-4 items-start" style={{ gridTemplateColumns: comparisonGridTemplate }}>
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">
                  Dimension
                </div>
                {selectedTools.map((tool) => (
                  <PanelLink
                    key={`${tool.category}/${tool.slug}`}
                    href={`/${tool.category}/${tool.slug}`}
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {tool.title}
                  </PanelLink>
                ))}
              </div>

              <div className="grid gap-4 items-start border-t border-gray-200 dark:border-gray-700 pt-4" style={{ gridTemplateColumns: comparisonGridTemplate }}>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Overview
                </div>
                {selectedTools.map((tool) => {
                  const overviewText = formatCardOverview(tool.overview || '');
                  return (
                    <div key={`${tool.category}/${tool.slug}`} className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed break-words whitespace-pre-wrap">
                      {overviewText || 'No overview available'}
                    </div>
                  );
                })}
              </div>

              {getDimensionCategories().map((dimension) => {
                const dimensionTags = selectedTools.map(tool => getTagsForDimension(dimension, tool));
                const hasAnyTags = dimensionTags.some(tags => tags.length > 0);

                if (!hasAnyTags) return null;

                return (
                  <div key={dimension} className="grid gap-4 items-start border-t border-gray-200 dark:border-gray-700 pt-4" style={{ gridTemplateColumns: comparisonGridTemplate }}>
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 capitalize">
                      {dimension.replace(/-/g, ' ')}
                    </div>
                    {selectedTools.map((tool, idx) => (
                      <div key={`${tool.category}/${tool.slug}`} className="flex flex-wrap gap-1">
                        {dimensionTags[idx].length > 0 ? (
                          dimensionTags[idx].map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 whitespace-nowrap"
                            >
                              {tag.replace(/-/g, ' ')}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}

              <div className="grid gap-4 items-start border-t border-gray-200 dark:border-gray-700 pt-4" style={{ gridTemplateColumns: comparisonGridTemplate }}>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  All tags
                </div>
                {selectedTools.map((tool) => (
                  <div key={`${tool.category}/${tool.slug}`} className="flex flex-wrap gap-1">
                    {tool.tags.length > 0 ? (
                      tool.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 whitespace-nowrap"
                        >
                          {tag.replace(/-/g, ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : bookmarkedResources.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No favorites yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start bookmarking tools you find useful by clicking the bookmark icon on any tool card.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarkedResources.map((resource) => {
                const isSelected = selectedTools.some(t => t.slug === resource.slug && t.category === resource.category);
                const canSelect = selectedTools.length < 3 || isSelected;
                
                return (
                  <div
                    key={`${resource.category}/${resource.slug}`}
                    className="relative"
                  >
                    <CardLink
                      href={`/${resource.category}/${resource.slug}`}
                      className={`p-3 rounded-xl hover:shadow-sm group relative z-10 pr-10 ${isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-500' : ''}`}
                      onClick={onClose}
                    >
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {resource.category}
                      </p>
                    </CardLink>
                    
                    {/* Selection checkbox - positioned on the right */}
                    <div className="absolute top-3 right-3 z-20">
                      <Button variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSelectTool(resource);
                        }}
                        disabled={!canSelect && !isSelected}
                        className={`w-5 h-5 p-0 rounded-none border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600'
                            : canSelect
                            ? 'border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500'
                            : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                        }`}
                        title={isSelected ? 'Deselect' : canSelect ? 'Select for comparison' : 'Maximum 3 tools selected'}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  , document.body);
}
