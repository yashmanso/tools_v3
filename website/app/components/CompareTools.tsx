'use client';

import { useState } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { PanelLink } from './PanelLink';
import { ResourceCard } from './ResourceCard';
import { convertMarkdownLinksToHTML } from '../lib/markdownLinks';

interface CompareToolsProps {
  allResources: ResourceMetadata[];
}

export function CompareTools({ allResources }: CompareToolsProps) {
  const [selectedTools, setSelectedTools] = useState<ResourceMetadata[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const tools = allResources.filter(r => r.category === 'tools');

  const handleSelectTool = (tool: ResourceMetadata) => {
    if (selectedTools.find(t => t.slug === tool.slug)) {
      // Remove if already selected
      setSelectedTools(selectedTools.filter(t => t.slug !== tool.slug));
    } else if (selectedTools.length < 3) {
      // Add if under limit
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleRemoveTool = (slug: string) => {
    setSelectedTools(selectedTools.filter(t => t.slug !== slug));
  };

  const handleCompare = () => {
    if (selectedTools.length >= 2) {
      setShowComparison(true);
    }
  };

  const handleReset = () => {
    setSelectedTools([]);
    setShowComparison(false);
  };

  // Get unique tags across all selected tools
  const getAllTags = (): string[] => {
    const tagSet = new Set<string>();
    selectedTools.forEach(tool => {
      tool.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  // Get dimension categories from tags
  const getDimensionCategories = (): string[] => {
    const categories = [
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
    return categories;
  };

  // Get tags for a specific dimension
  const getTagsForDimension = (dimension: string, tool: ResourceMetadata): string[] => {
    // Map dimension names to tag patterns
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

  if (showComparison && selectedTools.length >= 2) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Compare tools</h2>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            Start over
          </button>
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse table-fixed">
            <colgroup>
              <col style={{ width: '20%' }} />
              {selectedTools.map((_, idx) => (
                <col key={idx} style={{ width: `${80 / selectedTools.length}%` }} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                <th className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100">Dimension</th>
                {selectedTools.map((tool) => (
                  <th key={tool.slug} className="p-4 text-left font-semibold text-gray-900 dark:text-gray-100">
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
                  
                  // Convert markdown links to HTML
                  const overviewWithLinks = convertMarkdownLinksToHTML(overviewText);
                  
                  return (
                    <td key={tool.slug} className="p-4 text-sm text-gray-600 dark:text-gray-400 align-top group/overview relative">
                      {overviewText ? (
                        <>
                          <div 
                            className="line-clamp-3 break-words"
                            dangerouslySetInnerHTML={{ __html: overviewWithLinks }}
                          />
                          {isLong && (
                            <span className="ml-1 text-blue-500 text-xs">(hover for full)</span>
                          )}
                          {isLong && (
                            <div className="absolute left-0 top-full mt-2 w-96 bg-white dark:bg-gray-800 shadow-xl opacity-0 invisible group-hover/overview:opacity-100 group-hover/overview:visible z-[100] transition-all duration-200 pointer-events-none relative">
                              {/* Left border frame */}
                              <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                              
                              {/* Right border frame */}
                              <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                              
                              <div className="p-4 pl-5 pr-5">
                                <div 
                                  className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed break-words whitespace-pre-wrap"
                                  dangerouslySetInnerHTML={{ __html: overviewWithLinks }}
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
                      <td key={tool.slug} className="p-4 align-top">
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
                                  <div className="absolute left-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 transition-all duration-200 pointer-events-none relative">
                                    {/* Left border frame */}
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                                    
                                    {/* Right border frame */}
                                    <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                                    
                                    <div className="p-3 pl-4 pr-4">
                                      <div className="flex flex-wrap gap-1">
                                        {dimensionTags[idx].map((tag) => (
                                          <span
                                            key={tag}
                                            className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
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
                  <td key={tool.slug} className="p-4 align-top">
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
                            {/* Left border frame */}
                            <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                            
                            {/* Right border frame */}
                            <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                            
                            <div className="p-3 pl-4 pr-4">
                              <div className="flex flex-wrap gap-1">
                                {tool.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
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
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Compare tools</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select up to 3 tools to compare their features, dimensions, and use cases.
        </p>
      </div>

      {/* Selected tools */}
      {selectedTools.length > 0 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Selected tools ({selectedTools.length}/3)
            </h3>
            {selectedTools.length >= 2 && (
              <button
                onClick={handleCompare}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm"
              >
                Compare selected tools
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTools.map((tool) => (
              <div
                key={tool.slug}
                className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-full border border-blue-300 dark:border-blue-700"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {tool.title}
                </span>
                <button
                  onClick={() => handleRemoveTool(tool.slug)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  aria-label="Remove tool"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tool selection */}
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
        </div>

        {/* Results grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {tools
            .filter((tool) => {
              const matchesSearch =
                searchQuery === '' ||
                tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                tool.overview?.toLowerCase().includes(searchQuery.toLowerCase());
              return matchesSearch;
            })
            .map((tool, idx) => {
              const isSelected = selectedTools.some(t => t.slug === tool.slug);
              const canSelect = selectedTools.length < 3 || isSelected;
              
              return (
                <div key={tool.slug} className="relative">
                  <ResourceCard 
                    resource={tool} 
                    allResources={allResources} 
                    animationDelay={idx * 50}
                    showSelectionButton={true}
                    isSelected={isSelected}
                    canSelect={canSelect}
                    onSelect={() => handleSelectTool(tool)}
                  />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
