'use client';

import { useMemo } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { analyzeCompatibility, CompatibilityResult } from '../lib/compatibility';
import { PanelLink } from './PanelLink';

interface ToolCompatibilityProps {
  currentTool: ResourceMetadata;
  allResources: ResourceMetadata[];
}

export function ToolCompatibility({ currentTool, allResources }: ToolCompatibilityProps) {
  const tools = useMemo(() => {
    return allResources.filter(r => r.category === 'tools');
  }, [allResources]);

  const analysis = useMemo(() => {
    return analyzeCompatibility([currentTool], tools);
  }, [currentTool, tools]);

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

  const hasAnyResults = analysis.complementaryTools.length > 0 ||
    analysis.overlappingTools.length > 0 ||
    analysis.conflictingTools.length > 0;

  if (!hasAnyResults) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
        Tool Compatibility
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        See which tools work well with <strong>{currentTool.title}</strong>, which overlap, and which might conflict
      </p>

      {/* Warnings */}
      {analysis.recommendations.filter(r => r.includes('⚠️')).length > 0 && (
        <div className="mb-6 space-y-2">
          {analysis.recommendations.filter(r => r.includes('⚠️')).map((rec, index) => (
            <div
              key={index}
              className="p-4 rounded-xl border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
            >
              <p className="text-sm font-medium">{rec}</p>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6">
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
              These tools work well together with <strong>{currentTool.title}</strong>
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.complementaryTools.slice(0, 6).map((result) => (
                <div
                  key={result.tool.slug}
                  className={`p-4 rounded-xl border ${getRelationshipColor(result.relationship)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <PanelLink
                      href={`/${result.tool.category}/${result.tool.slug}`}
                      className="flex-1 hover:no-underline"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {result.tool.title}
                      </h4>
                    </PanelLink>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium">
                      Compatibility: {Math.round(result.score)}%
                    </span>
                  </div>
                  {result.reasons.length > 0 && (
                    <ul className="text-xs space-y-1 mb-2">
                      {result.reasons.slice(0, 2).map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <span>•</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {result.sharedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.sharedTags.slice(0, 3).map((tag) => (
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
              These tools have significant overlap with <strong>{currentTool.title}</strong> - consider if you need both
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.overlappingTools.slice(0, 4).map((result) => (
                <div
                  key={result.tool.slug}
                  className={`p-4 rounded-xl border ${getRelationshipColor(result.relationship)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <PanelLink
                      href={`/${result.tool.category}/${result.tool.slug}`}
                      className="flex-1 hover:no-underline"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {result.tool.title}
                      </h4>
                    </PanelLink>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium">
                      Overlap: {Math.round(result.score)}%
                    </span>
                  </div>
                  {result.reasons.length > 0 && (
                    <ul className="text-xs space-y-1">
                      {result.reasons.slice(0, 2).map((reason, idx) => (
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
              ⚠️ Warning: These tools may conflict with <strong>{currentTool.title}</strong> or overlap too much
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {analysis.conflictingTools.slice(0, 4).map((result) => (
                <div
                  key={result.tool.slug}
                  className={`p-4 rounded-xl border ${getRelationshipColor(result.relationship)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <PanelLink
                      href={`/${result.tool.category}/${result.tool.slug}`}
                      className="flex-1 hover:no-underline"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {result.tool.title}
                      </h4>
                    </PanelLink>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium">
                      Conflict score: {Math.round(result.score)}%
                    </span>
                  </div>
                  {result.reasons.length > 0 && (
                    <ul className="text-xs space-y-1">
                      {result.reasons.slice(0, 2).map((reason, idx) => (
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
                      <span>{result.conflictingTags.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
