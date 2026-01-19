'use client';

import { useState, useEffect } from 'react';
import { getBookmarkedResources } from '../lib/bookmarks';
import { PanelLink } from './PanelLink';
import { ResourceMetadata } from '../lib/markdown';

interface FavoritesModalProps {
  allResources: ResourceMetadata[];
  onClose: () => void;
}

import { convertMarkdownLinksToHTML } from '../lib/markdownLinks';
import { Button } from '@/components/ui/button';

export function FavoritesModal({ allResources, onClose }: FavoritesModalProps) {
  const [bookmarkedResources, setBookmarkedResources] = useState<ResourceMetadata[]>([]);
  const [selectedTools, setSelectedTools] = useState<ResourceMetadata[]>([]);
  const [showComparison, setShowComparison] = useState(false);

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

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, showComparison]);

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

  return (
    <div
      className="fixed inset-0 z-[100] bg-black bg-opacity-75"
      style={{ top: '80px', pointerEvents: 'auto' }}
      onClick={onClose}
    >
      <div
        className={`absolute top-4 left-1/2 -translate-x-1/2 w-full ${
          showComparison ? 'max-w-6xl' : 'max-w-2xl'
        } max-h-[calc(100vh-120px)] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto`}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {showComparison ? 'Compare tools' : 'Your favorites'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                Back to favorites
              </Button>
            ) : (
              <>
                {selectedTools.length >= 2 && (
                  <Button variant="ghost"
                    onClick={handleCompare}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Compare ({selectedTools.length})
                  </Button>
                )}
              </>
            )}
            <Button variant="ghost"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {showComparison && selectedTools.length >= 2 ? (
            /* Comparison View */
            <div className="overflow-x-auto">
              <table className="w-full table-fixed border-collapse">
                <colgroup>
                  <col style={{ width: '20%' }} />
                  {selectedTools.map((_, index) => (
                    <col key={index} style={{ width: `${80 / selectedTools.length}%` }} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100 align-top">Dimension</th>
                    {selectedTools.map((tool) => (
                      <th key={`${tool.category}/${tool.slug}`} className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100 align-top">
                        <PanelLink
                          href={`/${tool.category}/${tool.slug}`}
                          className="hover:no-underline"
                        >
                          <div className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                            {tool.title}
                          </div>
                        </PanelLink>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Overview */}
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300 align-top">Overview</td>
                    {selectedTools.map((tool) => {
                      const overviewText = tool.overview || '';
                      const isLong = overviewText.length > 150;
                      
                      return (
                        <td key={`${tool.category}/${tool.slug}`} className="p-4 text-sm text-gray-600 dark:text-gray-400 align-top group/overview relative">
                          {overviewText ? (
                            <>
                              <div 
                                className="line-clamp-3 break-words"
                                dangerouslySetInnerHTML={{ __html: convertMarkdownLinksToHTML(overviewText) }}
                              />
                              {isLong && (
                                <span className="ml-1 text-blue-500 text-xs">(hover for full)</span>
                              )}
                              {isLong && (
                                <div className="absolute left-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 shadow-xl opacity-0 invisible group-hover/overview:opacity-100 group-hover/overview:visible z-[100] transition-all duration-200 pointer-events-none relative">
                                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                                  <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                                  <div className="p-4 pl-5 pr-5">
                                    <div 
                                      className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words whitespace-pre-wrap"
                                      dangerouslySetInnerHTML={{ __html: convertMarkdownLinksToHTML(overviewText) }}
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">No overview available</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Dimensions */}
                  {getDimensionCategories().map((dimension) => {
                    const dimensionTags = selectedTools.map(tool => getTagsForDimension(dimension, tool));
                    const hasAnyTags = dimensionTags.some(tags => tags.length > 0);
                    
                    if (!hasAnyTags) return null;

                    return (
                      <tr key={dimension} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="p-4 font-medium text-gray-700 dark:text-gray-300 capitalize align-top">
                          {dimension.replace(/-/g, ' ')}
                        </td>
                        {selectedTools.map((tool, idx) => (
                          <td key={`${tool.category}/${tool.slug}`} className="p-4 align-top">
                            <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden group relative cursor-help">
                              {dimensionTags[idx].length > 0 ? (
                                <>
                                  {dimensionTags[idx].slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 whitespace-nowrap"
                                    >
                                      {tag.replace(/-/g, ' ')}
                                    </span>
                                  ))}
                                  {dimensionTags[idx].length > 3 && (
                                    <>
                                      <span className="text-xs text-gray-400">+{dimensionTags[idx].length - 3}</span>
                                      <div className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 transition-all duration-200 pointer-events-none max-h-64 overflow-y-auto relative">
                                        <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                                        <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                                        <div className="p-3 pl-5 pr-5">
                                          <div className="flex flex-wrap gap-1">
                                            {dimensionTags[idx].map((tag) => (
                                              <span
                                                key={tag}
                                                className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 whitespace-nowrap"
                                              >
                                                {tag.replace(/-/g, ' ')}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </div>
                          </td>
                        ))}
                      </tr>
                    );
                  })}

                  {/* All tags */}
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-4 font-medium text-gray-700 dark:text-gray-300 align-top">All tags</td>
                    {selectedTools.map((tool) => (
                      <td key={`${tool.category}/${tool.slug}`} className="p-4 align-top">
                        <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden group relative cursor-help">
                          {tool.tags.slice(0, 6).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 whitespace-nowrap"
                            >
                              {tag.replace(/-/g, ' ')}
                            </span>
                          ))}
                          {tool.tags.length > 6 && (
                            <>
                              <span className="text-xs text-gray-400">+{tool.tags.length - 6}</span>
                              <div className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 transition-all duration-200 pointer-events-none max-h-64 overflow-y-auto relative">
                                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                                <div className="p-3 pl-5 pr-5">
                                  <div className="flex flex-wrap gap-1">
                                    {tool.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 whitespace-nowrap"
                                      >
                                        {tag.replace(/-/g, ' ')}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
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
            <div className="space-y-2">
              {bookmarkedResources.map((resource) => {
                const isSelected = selectedTools.some(t => t.slug === resource.slug && t.category === resource.category);
                const canSelect = selectedTools.length < 3 || isSelected;
                
                return (
                  <div
                    key={`${resource.category}/${resource.slug}`}
                    className={`relative p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-blue-500 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {/* Selection checkbox */}
                    <div className="absolute top-4 left-4">
                      <Button variant="ghost"
                        onClick={() => handleSelectTool(resource)}
                        disabled={!canSelect && !isSelected}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
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
                    
                    <PanelLink
                      href={`/${resource.category}/${resource.slug}`}
                      className="block ml-8 group"
                      onClick={onClose}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {resource.title}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mb-2">
                            {resource.category}
                          </p>
                          {resource.overview && (
                            <div 
                              className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2"
                              dangerouslySetInnerHTML={{ __html: convertMarkdownLinksToHTML(resource.overview.substring(0, 150) + '...') }}
                            />
                          )}
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </PanelLink>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
