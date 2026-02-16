'use client';

import { useState, useMemo } from 'react';
import type { ResourceMetadata } from '../lib/markdown';
import { PanelLink } from './PanelLink';
import { ResourceCard } from './ResourceCard';
import { Button } from '@/components/ui/button';

interface VisualToolSelectorProps {
  allResources: ResourceMetadata[];
}

interface DecisionState {
  goal: string | null;
  audience: string | null;
  timeline: string | null;
}

const GOALS = [
  { id: 'map', label: 'Map & Design', icon: null, description: 'Map out concepts, models, or strategies' },
  { id: 'assess', label: 'Assess & Measure', icon: null, description: 'Evaluate impact, performance, or sustainability' },
  { id: 'report', label: 'Report & Communicate', icon: null, description: 'Create reports and communicate findings' },
  { id: 'align', label: 'Align & Strategize', icon: null, description: 'Align goals and create strategy' },
];

const AUDIENCES = [
  { id: 'entrepreneurs', label: 'Entrepreneurs', icon: null },
  { id: 'startups', label: 'Startups', icon: null },
  { id: 'SMEs', label: 'SMEs', icon: null },
  { id: 'corporations', label: 'Corporations', icon: null },
  { id: 'researchers', label: 'Researchers', icon: null },
  { id: 'students', label: 'Students', icon: null },
  { id: 'educators', label: 'Educators', icon: null },
  { id: 'practitioners', label: 'Practitioners', icon: null },
  { id: 'intrapreneurs', label: 'Intrapreneurs', icon: null },
  { id: 'corporate-managers', label: 'Corporate Managers', icon: null },
  { id: 'civil-servants', label: 'Civil Servants', icon: null },
];

const TIMELINES = [
  { id: 'quick', label: 'Quick (< 1 hour)', icon: null, value: 1 },
  { id: 'short', label: 'Short (1-4 hours)', icon: null, value: 2 },
  { id: 'medium', label: 'Medium (Half day)', icon: null, value: 3 },
  { id: 'long', label: 'Long (Full day+)', icon: null, value: 4 },
];
export function VisualToolSelector({ allResources }: VisualToolSelectorProps) {
  const [decisionState, setDecisionState] = useState<DecisionState>({
    goal: null,
    audience: null,
    timeline: null,
  });

  const [filters, setFilters] = useState({
    sustainabilityFocus: [] as string[],
    innovationType: [] as string[],
    stage: [] as string[],
    maxComplexity: 5, // 1-5 scale
  });

  const tools = useMemo(() => {
    return allResources.filter(r => r.category === 'tools');
  }, [allResources]);

  const filteredTools = useMemo(() => {
    let filtered = [...tools];

    // Filter by decision tree selections
    if (decisionState.goal) {
      filtered = filtered.filter(tool => tool.tags.includes(decisionState.goal!));
    }
    if (decisionState.audience) {
      filtered = filtered.filter(tool => tool.tags.includes(decisionState.audience!));
    }

    // Filter by sustainability focus
    if (filters.sustainabilityFocus.length > 0) {
      filtered = filtered.filter(tool =>
        filters.sustainabilityFocus.some(focus => tool.tags.includes(focus))
      );
    }

    // Filter by innovation type
    if (filters.innovationType.length > 0) {
      filtered = filtered.filter(tool =>
        filters.innovationType.some(type => tool.tags.includes(type))
      );
    }

    // Filter by stage
    if (filters.stage.length > 0) {
      filtered = filtered.filter(tool =>
        filters.stage.some(stage => tool.tags.includes(stage))
      );
    }

    return filtered;
  }, [tools, decisionState, filters]);

  const handleGoalSelect = (goalId: string) => {
    setDecisionState(prev => ({
      ...prev,
      goal: prev.goal === goalId ? null : goalId,
    }));
  };

  const handleAudienceSelect = (audienceId: string) => {
    setDecisionState(prev => ({
      ...prev,
      audience: prev.audience === audienceId ? null : audienceId,
    }));
  };

  const handleTimelineSelect = (timelineId: string) => {
    setDecisionState(prev => ({
      ...prev,
      timeline: prev.timeline === timelineId ? null : timelineId,
    }));
  };

  const handleFilterToggle = (category: keyof typeof filters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[category] as string[];
      if (Array.isArray(currentArray)) {
        return {
          ...prev,
          [category]: currentArray.includes(value)
            ? currentArray.filter(v => v !== value)
            : [...currentArray, value],
        };
      }
      return prev;
    });
  };

  const handleComplexityChange = (value: number) => {
    setFilters(prev => ({
      ...prev,
      maxComplexity: value,
    }));
  };

  const resetFilters = () => {
    setDecisionState({ goal: null, audience: null, timeline: null });
    setFilters({
      sustainabilityFocus: [],
      innovationType: [],
      stage: [],
      maxComplexity: 5,
    });
  };

  const currentStep = decisionState.goal ? (decisionState.audience ? 3 : 2) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Visual Tool Selector</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Answer a few questions and use visual filters to find the perfect tools for your needs
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left: Decision Tree */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Decision Tree Flow */}
          <div className="bg-[var(--bg-secondary)] rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-900 dark:text-gray-100">
              Decision Tree
            </h3>

            {/* Step 1: Goal */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                  1
                </div>
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  What's your goal?
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-4 gap-3 sm:gap-4 ml-0 sm:ml-11 items-stretch">
                {GOALS.map((goal) => (
                  <Button variant="ghost"
                    key={goal.id}
                    onClick={() => handleGoalSelect(goal.id)}
                    className={`p-4 rounded-2xl border-2 transition-all text-left whitespace-normal h-full items-start justify-start min-h-[64px] ${
                      decisionState.goal === goal.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className="flex items-center justify-center w-full h-full">
                      <div className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-gray-100 leading-tight break-words text-center">
                        {goal.label}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Connection Line */}
            {decisionState.goal && (
              <div className="flex justify-center mb-8">
                <div className="w-0.5 h-8 bg-blue-400 dark:bg-blue-600"></div>
              </div>
            )}

            {/* Step 2: Audience */}
            {decisionState.goal && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                  }`}>
                    2
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Who's your audience?
                  </h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 ml-0 sm:ml-11 items-stretch">
                  {AUDIENCES.map((audience) => (
                    <Button variant="ghost"
                      key={audience.id}
                      onClick={() => handleAudienceSelect(audience.id)}
                      className={`p-3 rounded-2xl border-2 transition-all text-center whitespace-normal h-full items-center justify-center w-full min-h-[56px] ${
                        decisionState.audience === audience.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      <div className="flex items-center justify-center w-full h-full">
                        <div className="font-medium text-[0.6875rem] sm:text-xs text-gray-900 dark:text-gray-100 leading-tight break-words text-center">
                          {audience.label}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Connection Line */}
            {decisionState.audience && (
              <div className="flex justify-center mb-8">
                <div className="w-0.5 h-8 bg-blue-400 dark:bg-blue-600"></div>
              </div>
            )}

            {/* Step 3: Timeline */}
            {decisionState.audience && (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm bg-blue-600 text-white">
                    3
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    What's your timeline?
                  </h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 ml-0 sm:ml-11 items-stretch">
                  {TIMELINES.map((timeline) => (
                    <Button variant="ghost"
                      key={timeline.id}
                      onClick={() => handleTimelineSelect(timeline.id)}
                      className={`p-3 rounded-2xl border-2 transition-all text-center whitespace-normal h-full items-center justify-center w-full min-h-[56px] ${
                        decisionState.timeline === timeline.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      <div className="flex items-center justify-center w-full h-full">
                        <div className="font-medium text-[0.6875rem] sm:text-xs text-gray-900 dark:text-gray-100 leading-tight break-words text-center">
                          {timeline.label}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Reset Button */}
            {(decisionState.goal || decisionState.audience || decisionState.timeline) && (
              <div className="mt-6 flex justify-end">
                <Button variant="ghost"
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                >
                  Reset all
                </Button>
              </div>
            )}
          </div>

          {/* Results */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Results ({filteredTools.length})
              </h3>
            </div>
            {filteredTools.length === 0 ? (
              <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-3xl border border-gray-200 dark:border-gray-700 border-dashed">
                <p className="text-gray-500 dark:text-gray-400 mb-2">No tools match your criteria</p>
                <Button variant="ghost"
                  onClick={resetFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Reset filters
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredTools.slice(0, 12).map((tool) => (
                  <ResourceCard
                    key={tool.slug}
                    resource={tool}
                    allResources={allResources}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Visual Filters */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4 space-y-4 sm:space-y-6">
            {/* Sustainability Focus */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Sustainability Focus
              </h4>
              <div className="space-y-2">
                {[
                  'environmental-sustainability',
                  'social-sustainability',
                  'economic-sustainability',
                  'circular-economy',
                  'SDGs',
                ].map((focus) => (
                  <label
                    key={focus}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filters.sustainabilityFocus.includes(focus)}
                      onChange={() => handleFilterToggle('sustainabilityFocus', focus)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 capitalize">
                      {focus.replace(/-/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Innovation Type */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Innovation Type
              </h4>
              <div className="space-y-2">
                {[
                  'product-innovation',
                  'process-innovation',
                  'business-model-innovation',
                  'social-innovation',
                  'technological-innovation',
                ].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filters.innovationType.includes(type)}
                      onChange={() => handleFilterToggle('innovationType', type)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 capitalize">
                      {type.replace(/-/g, ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stage */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Stage
              </h4>
              <div className="space-y-2">
                {[
                  'ideation',
                  'design',
                  'development',
                  'implementation',
                  'startup',
                  'growth',
                ].map((stage) => (
                  <label
                    key={stage}
                    className="flex items-center gap-2 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filters.stage.includes(stage)}
                      onChange={() => handleFilterToggle('stage', stage)}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 capitalize">
                      {stage}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Complexity Slider */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h4 className="font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Max Complexity
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Simple (1)</span>
                  <span>Complex (5)</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={filters.maxComplexity}
                  onChange={(e) => handleComplexityChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex items-center justify-center pt-2">
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-700 dark:text-blue-300 font-medium text-sm">
                    Up to level {filters.maxComplexity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
