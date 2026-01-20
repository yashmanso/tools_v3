'use client';
import type { ResourceMetadata } from '../lib/markdown';
import { getPrerequisitesForTool } from '../lib/prerequisites';
import { PanelLink } from './PanelLink';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ToolPrerequisitesProps {
  tool: ResourceMetadata;
  allResources: ResourceMetadata[];
}

export function ToolPrerequisites({ tool, allResources }: ToolPrerequisitesProps) {
  const prerequisites = getPrerequisitesForTool(tool.slug);

  // Show section if prerequisites exist, even if the array is empty (to show notes)
  if (!prerequisites) {
    return null;
  }

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700';
      case 'intermediate':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700';
      case 'advanced':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-300 dark:border-orange-700';
      case 'expert':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700';
    }
  };

  const findRelatedTool = (prereq: { name: string; link?: string; type: string }): ResourceMetadata | null => {
    // If a direct link is provided, use it
    if (prereq.link) {
      const slug = prereq.link.split('/').pop();
      if (slug) {
        return allResources.find(r => r.slug === slug) || null;
      }
    }
    
    // Otherwise, try to find a tool that matches the concept name
    const searchTerms = prereq.name.toLowerCase().split(' ');
    return allResources.find(resource => {
      const titleLower = resource.title.toLowerCase();
      return searchTerms.some(term => titleLower.includes(term));
    }) || null;
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 relative z-10">
      <details className="group">
        <Button
          asChild
          variant="outline"
          className="w-full justify-between p-4 h-auto rounded-xl border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 bg-[var(--bg-secondary)]"
        >
          <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden flex items-center justify-between">
            <span className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span className="text-left">
                <span className="block text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Before using this tool, you should know...
                </span>
                <span className="block text-sm text-gray-600 dark:text-gray-400">
                  {prerequisites.prerequisites.length > 0 
                    ? `${prerequisites.prerequisites.length} prerequisite${prerequisites.prerequisites.length !== 1 ? 's' : ''} • ${prerequisites.skillLevelRequired} level`
                    : `No prerequisites required • ${prerequisites.skillLevelRequired} level`
                  }
                </span>
              </span>
            </span>
        <svg
          className="w-5 h-5 text-gray-600 dark:text-gray-400 transition-transform duration-200 group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
          </summary>
        </Button>

        <div className="mt-4 space-y-4">
          {/* Skill Level Requirement */}
          <div className={`p-4 rounded-xl border ${getSkillLevelColor(prerequisites.skillLevelRequired)}`}>
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span className="font-semibold">Skill Level Required:</span>
              <span className="capitalize">{prerequisites.skillLevelRequired}</span>
            </div>
          </div>

          {/* Prerequisites List */}
          {prerequisites.prerequisites.length > 0 ? (
            <div className="space-y-3">
              {prerequisites.prerequisites.map((prereq, index) => {
              const relatedTool = findRelatedTool(prereq);
              
              return (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-[var(--bg-secondary)]"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {prereq.type === 'tool' ? (
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      ) : prereq.type === 'concept' ? (
                        <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                            {prereq.name}
                          </h4>
                          {prereq.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {prereq.description}
                            </p>
                          )}
                        </div>
                        {prereq.skillLevel && (
                          <Badge className={getSkillLevelColor(prereq.skillLevel)}>
                            {prereq.skillLevel}
                          </Badge>
                        )}
                      </div>
                      {relatedTool && (
                        <PanelLink
                          href={`/${relatedTool.category}/${relatedTool.slug}`}
                          className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2"
                        >
                          View related tool: {relatedTool.title} →
                        </PanelLink>
                      )}
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Great news!</strong> This tool has no specific prerequisites and is accessible to all users.
              </p>
            </div>
          )}

          {/* Notes */}
          {prerequisites.notes && (
            <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> {prerequisites.notes}
              </p>
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
