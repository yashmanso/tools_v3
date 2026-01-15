'use client';

import { useState, useMemo } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { analyzeCompatibility, CompatibilityResult } from '../lib/compatibility';

interface ToolCompatibilityCheckerProps {
  allResources: ResourceMetadata[];
}

export function ToolCompatibilityChecker({ allResources }: ToolCompatibilityCheckerProps) {
  const [selectedTools, setSelectedTools] = useState<ResourceMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const tools = useMemo(() => {
    return allResources.filter(r => r.category === 'tools');
  }, [allResources]);

  const analysis = useMemo(() => {
    return analyzeCompatibility(selectedTools, tools);
  }, [selectedTools, tools]);

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return tools.slice(0, 30);
    const query = searchQuery.toLowerCase();
    return tools.filter(tool =>
      tool.title.toLowerCase().includes(query) ||
      tool.tags.some(tag => tag.toLowerCase().includes(query))
    ).slice(0, 30);
  }, [tools, searchQuery]);

  const handleToggleTool = (tool: ResourceMetadata) => {
    if (selectedTools.some(t => t.slug === tool.slug)) {
      setSelectedTools(selectedTools.filter(t => t.slug !== tool.slug));
    } else {
      if (selectedTools.length < 5) {
        setSelectedTools([...selectedTools, tool]);
      }
    }
  };

  const handleRemoveTool = (toolSlug: string) => {
    setSelectedTools(selectedTools.filter(t => t.slug !== toolSlug));
  };

  const getRelationshipColor = (relationship: CompatibilityResult['relationship']) => {
    switch (relationship) {
      case 'complementary':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'overlap':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'conflict':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  const getRelationshipIcon = (relationship: CompatibilityResult['relationship']) => {
    switch (relationship) {
      case 'complementary':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'overlap':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'conflict':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Tool Compatibility Checker</h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select tools to see which ones work well together, which overlap, and which might conflict
        </p>
      </div>

      {/* Selected Tools */}
      {selectedTools.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Selected Tools ({selectedTools.length}/5)
            </h3>
            <button
              onClick={() => setSelectedTools([])}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {selectedTools.map((tool) => (
              <div
                key={tool.slug}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full"
              >
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {tool.title}
                </span>
                <button
                  onClick={() => handleRemoveTool(tool.slug)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="mb-6 space-y-2">
          {analysis.recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border ${
                rec.includes('⚠️')
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                  : rec.includes('ℹ️')
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
                  : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              }`}
            >
              <p className="text-sm font-medium">{rec}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Tool Selection */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--bg-secondary)] rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sticky top-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Select Tools
            </h3>
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 mb-4 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredTools.map((tool) => {
                const isSelected = selectedTools.some(t => t.slug === tool.slug);
                return (
                  <div
                    key={tool.slug}
                    onClick={() => handleToggleTool(tool)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        isSelected
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {tool.title}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedTools.length >= 5 && (
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                Maximum 5 tools selected
              </p>
            )}
          </div>
        </div>

        {/* Right: Compatibility Results */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTools.length === 0 ? (
            <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-3xl border border-gray-200 dark:border-gray-700 border-dashed">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Select tools to check compatibility</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Choose up to 5 tools to see which ones work well together
              </p>
            </div>
          ) : (
            <>
              {/* Complementary Tools */}
              {analysis.complementaryTools.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {getRelationshipIcon('complementary')}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Complementary Tools ({analysis.complementaryTools.length})
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    These tools work well together and complement your selection
                  </p>
                  <div className="space-y-3">
                    {analysis.complementaryTools.map((result) => (
                      <div
                        key={result.tool.slug}
                        className={`p-4 rounded-xl border ${getRelationshipColor(result.relationship)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                              {result.tool.title}
                            </h4>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium">
                                Compatibility: {Math.round(result.score)}%
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleToggleTool(result.tool)}
                            className="px-3 py-1 text-xs border border-current rounded-full hover:bg-opacity-20 transition-colors"
                          >
                            {selectedTools.some(t => t.slug === result.tool.slug) ? 'Remove' : 'Add'}
                          </button>
                        </div>
                        {result.reasons.length > 0 && (
                          <ul className="text-xs space-y-1 mb-2">
                            {result.reasons.map((reason, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span>•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {result.sharedTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {result.sharedTags.slice(0, 5).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-0.5 bg-white dark:bg-gray-800 rounded-full border border-current border-opacity-30"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Overlapping Tools */}
              {analysis.overlappingTools.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {getRelationshipIcon('overlap')}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Overlapping Tools ({analysis.overlappingTools.length})
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    These tools have significant overlap with your selection - consider if you need both
                  </p>
                  <div className="space-y-3">
                    {analysis.overlappingTools.map((result) => (
                      <div
                        key={result.tool.slug}
                        className={`p-4 rounded-xl border ${getRelationshipColor(result.relationship)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                              {result.tool.title}
                            </h4>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium">
                                Overlap: {Math.round(result.score)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        {result.reasons.length > 0 && (
                          <ul className="text-xs space-y-1">
                            {result.reasons.map((reason, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span>•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Conflicting Tools */}
              {analysis.conflictingTools.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    {getRelationshipIcon('conflict')}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Conflicting Tools ({analysis.conflictingTools.length})
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    ⚠️ Warning: These tools may conflict with your selection or overlap too much
                  </p>
                  <div className="space-y-3">
                    {analysis.conflictingTools.map((result) => (
                      <div
                        key={result.tool.slug}
                        className={`p-4 rounded-xl border ${getRelationshipColor(result.relationship)}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                              {result.tool.title}
                            </h4>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-medium">
                                Conflict score: {Math.round(result.score)}%
                              </span>
                            </div>
                          </div>
                        </div>
                        {result.reasons.length > 0 && (
                          <ul className="text-xs space-y-1">
                            {result.reasons.map((reason, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span>⚠️</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {result.conflictingTags.length > 0 && (
                          <div className="mt-2 text-xs">
                            <span className="font-medium">Conflicting tags: </span>
                            <span>{result.conflictingTags.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {analysis.complementaryTools.length === 0 &&
                analysis.overlappingTools.length === 0 &&
                analysis.conflictingTools.length === 0 && (
                  <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-3xl border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">
                      No compatibility analysis available for these tools
                    </p>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
