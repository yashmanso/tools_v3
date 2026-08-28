'use client';

import { useMemo } from 'react';
import type { ResourceMetadata } from '../lib/markdown';
import { analyzeCompatibility, CompatibilityResult, CompatibilityLevel } from '../lib/compatibility';
import { PanelLink } from './PanelLink';

const LEVEL_LABELS: Record<CompatibilityLevel, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

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
      default:
        return null;
    }
  };

  const hasAnyResults = analysis.complementaryTools.length > 0 ||
    analysis.overlappingTools.length > 0;

  if (!hasAnyResults) {
    return null;
  }

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">
        Tool Compatibility
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        See which tools work well alongside <strong>{currentTool.title}</strong>, and which overlap with it enough that you may only need one
      </p>

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
                      {LEVEL_LABELS[result.level]} compatibility
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">{result.summary}</p>
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
                  <p className="text-xs leading-relaxed">{result.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
