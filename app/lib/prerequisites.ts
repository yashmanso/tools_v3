export interface Prerequisite {
  type: 'tool' | 'concept' | 'skill';
  name: string;
  description?: string;
  link?: string; // Link to another tool or resource
  skillLevel?: 'beginner' | 'intermediate' | 'advanced';
}

export interface ToolPrerequisites {
  toolSlug: string;
  prerequisites: Prerequisite[];
  skillLevelRequired: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTimeToLearn?: string;
  notes?: string;
}

import { TOOL_PREREQUISITES_DATA } from './prerequisites-data';

// Prerequisites data for all tools
export const TOOL_PREREQUISITES: Record<string, ToolPrerequisites> = TOOL_PREREQUISITES_DATA;

/**
 * Get prerequisites for a specific tool
 */
export function getPrerequisitesForTool(toolSlug: string): ToolPrerequisites | null {
  return TOOL_PREREQUISITES[toolSlug] || null;
}

/**
 * Get all prerequisites
 */
export function getAllPrerequisites(): Record<string, ToolPrerequisites> {
  return TOOL_PREREQUISITES;
}
