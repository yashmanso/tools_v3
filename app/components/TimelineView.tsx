'use client';

import { useMemo } from 'react';
import type { ResourceMetadata } from '../lib/markdown';
import { ResourceCard } from './ResourceCard';

interface TimelineViewProps {
  allResources: ResourceMetadata[];
}

// Define the innovation process stages in order
const INNOVATION_STAGES = [
  { id: 'ideation', label: 'Ideation', description: 'Exploring ideas and opportunities', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  { id: 'design', label: 'Design', description: 'Designing your solution or approach', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
  { id: 'development', label: 'Development', description: 'Developing and prototyping', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  { id: 'implementation', label: 'Implementation', description: 'Putting your solution into practice', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  { id: 'startup', label: 'Startup', description: 'Early stage startup', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' },
  { id: 'growth', label: 'Growth', description: 'Scaling and growing', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
  { id: 'scale-up', label: 'Scale-up', description: 'Expanding operations', color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' },
  { id: 'maturity', label: 'Maturity', description: 'Established and mature', color: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300' },
];

export function TimelineView({ allResources }: TimelineViewProps) {
  // Filter only tools (not collections or articles)
  const tools = useMemo(() => {
    return allResources.filter(r => r.category === 'tools');
  }, [allResources]);

  // Group tools by entrepreneurship stage
  const toolsByStage = useMemo(() => {
    const grouped: Record<string, ResourceMetadata[]> = {};
    
    // Initialize all stages
    INNOVATION_STAGES.forEach(stage => {
      grouped[stage.id] = [];
    });
    
    // Add "uncategorized" for tools without stage tags
    grouped['uncategorized'] = [];

    tools.forEach(tool => {
      // Check if tool has any entrepreneurship-stage tags
      const stageTags = ['ideation', 'design', 'development', 'implementation', 'startup', 'growth', 'scale-up', 'maturity'];
      const toolStages = tool.tags.filter(tag => stageTags.includes(tag));
      
      if (toolStages.length > 0) {
        // Add tool to the first matching stage (tools can have multiple stages, but we'll show in first one)
        const firstStage = toolStages[0];
        if (grouped[firstStage]) {
          grouped[firstStage].push(tool);
        }
      } else {
        grouped['uncategorized'].push(tool);
      }
    });

    return grouped;
  }, [tools]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl font-bold mb-2 sm:mb-3 text-center px-2">Tools by innovation process stage</h2>
        <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
          Explore tools organized by where they fit in the innovation journey, from initial ideation to mature implementation.
        </p>
      </div>

      {/* Timeline visualization */}
      <div className="relative mb-8 sm:mb-12">
        {/* Timeline line - hidden on mobile, visible on larger screens */}
        <div className="hidden sm:block absolute left-0 right-0 top-8 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 via-orange-500 to-indigo-500 rounded-full"></div>
        
        {/* Stage markers */}
        <div className="relative flex flex-wrap sm:flex-nowrap justify-center sm:justify-between items-start gap-4 sm:gap-0">
          {INNOVATION_STAGES.map((stage, index) => {
            const toolCount = toolsByStage[stage.id]?.length || 0;
            return (
              <div key={stage.id} className="flex flex-col items-center flex-1 min-w-[80px] sm:min-w-0">
                <div className={`relative z-10 w-12 h-12 sm:w-16 sm:h-16 rounded-full ${stage.color} flex items-center justify-center font-semibold text-xs sm:text-sm mb-2 border-2 border-white dark:border-gray-800 shadow-lg`}>
                  {index + 1}
                </div>
                <div className="text-center">
                  <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-gray-100 mb-1">
                    {stage.label}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {toolCount} {toolCount === 1 ? 'tool' : 'tools'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tools organized by stage */}
      <div className="space-y-8 sm:space-y-12">
        {INNOVATION_STAGES.map((stage) => {
          const stageTools = toolsByStage[stage.id] || [];
          if (stageTools.length === 0) return null;

          return (
            <div key={stage.id} className="relative">
              {/* Stage header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                <div className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${stage.color} font-semibold text-xs sm:text-sm`}>
                  {stage.label}
                </div>
                <div className="hidden sm:block flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {stageTools.length} {stageTools.length === 1 ? 'tool' : 'tools'}
                </div>
              </div>
              
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 ml-0 sm:ml-2">
                {stage.description}
              </p>

              {/* Tools grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {stageTools.map((tool, index) => (
                  <ResourceCard key={tool.slug} resource={tool} allResources={allResources} animationDelay={index * 50} />
                ))}
              </div>
            </div>
          );
        })}

        {/* Uncategorized tools */}
        {toolsByStage['uncategorized'] && toolsByStage['uncategorized'].length > 0 && (
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-xs sm:text-sm">
                Other tools
              </div>
              <div className="hidden sm:block flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                {toolsByStage['uncategorized'].length} {toolsByStage['uncategorized'].length === 1 ? 'tool' : 'tools'}
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 ml-0 sm:ml-2">
              Tools that don't have a specific innovation stage tag
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {toolsByStage['uncategorized'].map((tool, index) => (
                <ResourceCard key={tool.slug} resource={tool} allResources={allResources} animationDelay={index * 50} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
