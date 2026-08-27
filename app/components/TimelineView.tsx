'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
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
  // Currently selected stage (null = show every stage)
  const [selectedStage, setSelectedStage] = useState<string | null>(null);
  // Refs to each stage section so we can scroll to it when its marker is clicked
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
      // Normalize tags: scaleup -> scale-up for consistency
      const normalizedTags = tool.tags.map(tag => tag === 'scaleup' ? 'scale-up' : tag);
      const stageTags = ['ideation', 'design', 'development', 'implementation', 'startup', 'growth', 'scale-up', 'maturity'];
      const toolStages = normalizedTags.filter(tag => stageTags.includes(tag));

      if (toolStages.length > 0) {
        // Add tool to ALL matching stages (tools can span multiple stages)
        toolStages.forEach(stage => {
          if (grouped[stage]) {
            grouped[stage].push(tool);
          }
        });
      } else {
        grouped['uncategorized'].push(tool);
      }
    });

    return grouped;
  }, [tools]);

  // Scroll the selected stage's section into view once it has rendered
  useEffect(() => {
    if (!selectedStage) return;
    const el = sectionRefs.current[selectedStage];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedStage]);

  const handleStageClick = (stageId: string) => {
    // Clicking the active stage again clears the filter
    setSelectedStage(prev => (prev === stageId ? null : stageId));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl font-bold mb-2 sm:mb-3 text-center px-2">Tools by innovation process stage</h2>
        <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
          Explore tools organized by where they fit in the innovation journey, from initial ideation to mature implementation.
        </p>
      </div>

      {/* Timeline visualization */}
      <div className="relative mb-8 sm:mb-12">
        {/* Timeline line - hidden on mobile, visible on larger screens */}
        <div className="hidden lg:block absolute left-0 right-0 top-8 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 via-orange-500 to-indigo-500 rounded-full"></div>

        {/* Stage markers - horizontally scrollable on small screens */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="relative flex justify-between items-start gap-2 min-w-[640px] lg:min-w-0">
            {INNOVATION_STAGES.map((stage, index) => {
              const toolCount = toolsByStage[stage.id]?.length || 0;
              const isSelected = selectedStage === stage.id;
              const isDimmed = selectedStage !== null && !isSelected;
              const isEmpty = toolCount === 0;

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => handleStageClick(stage.id)}
                  disabled={isEmpty}
                  aria-pressed={isSelected}
                  title={
                    isEmpty
                      ? `No tools in ${stage.label}`
                      : isSelected
                        ? `Show all stages`
                        : `Show ${toolCount} ${toolCount === 1 ? 'tool' : 'tools'} in ${stage.label}`
                  }
                  className={`flex flex-col items-center w-[75px] lg:flex-1 bg-transparent rounded-xl p-1 transition-opacity ${
                    isEmpty ? 'cursor-default opacity-40' : 'cursor-pointer'
                  } ${isDimmed ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`}
                >
                  <div
                    className={`relative z-10 w-12 h-12 lg:w-16 lg:h-16 rounded-full ${stage.color} flex items-center justify-center font-semibold text-xs lg:text-sm mb-2 border-2 border-white dark:border-gray-800 shadow-lg transition-transform ${
                      isSelected
                        ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900 scale-110'
                        : isEmpty
                          ? ''
                          : 'hover:scale-105'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="text-center">
                    <div
                      className={`font-semibold text-[11px] lg:text-sm mb-1 whitespace-nowrap ${
                        isSelected
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {stage.label}
                    </div>
                    <div className="text-[10px] lg:text-xs text-gray-500 dark:text-gray-400 mb-1 whitespace-nowrap">
                      {toolCount} {toolCount === 1 ? 'tool' : 'tools'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active filter indicator */}
      {selectedStage && (
        <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Showing tools for{' '}
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {INNOVATION_STAGES.find(s => s.id === selectedStage)?.label}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setSelectedStage(null)}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border border-[var(--border)] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Show all stages
          </button>
        </div>
      )}

      {/* Tools organized by stage */}
      <div className="space-y-8 sm:space-y-12">
        {INNOVATION_STAGES.map((stage) => {
          const stageTools = toolsByStage[stage.id] || [];
          if (stageTools.length === 0) return null;
          // When a stage is selected, only render that stage's section
          if (selectedStage && selectedStage !== stage.id) return null;

          return (
            <div
              key={stage.id}
              ref={el => { sectionRefs.current[stage.id] = el; }}
              className="relative scroll-mt-24"
            >
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

        {/* Uncategorized tools - hidden while a specific stage is selected */}
        {!selectedStage && toolsByStage['uncategorized'] && toolsByStage['uncategorized'].length > 0 && (
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
