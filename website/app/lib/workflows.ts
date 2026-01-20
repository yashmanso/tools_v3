import { ResourceMetadata } from './markdown';

export interface WorkflowStep {
  toolId: string; // category/slug format
  tool: ResourceMetadata;
  notes?: string;
  order: number;
}

export interface Workflow {
  id: string;
  title: string;
  description?: string;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  isTemplate?: boolean;
  tags?: string[];
}

/**
 * Get all workflows from localStorage
 */
export function getAllWorkflows(): Workflow[] {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem('sustainability-workflows');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse workflows:', e);
  }

  return [];
}

/**
 * Save a workflow to localStorage
 */
export function saveWorkflow(workflow: Workflow): void {
  if (typeof window === 'undefined') return;

  try {
    const workflows = getAllWorkflows();
    const existingIndex = workflows.findIndex(w => w.id === workflow.id);
    
    if (existingIndex >= 0) {
      workflows[existingIndex] = workflow;
    } else {
      workflows.push(workflow);
    }
    
    localStorage.setItem('sustainability-workflows', JSON.stringify(workflows));
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('workflows-updated'));
  } catch (e) {
    console.error('Failed to save workflow:', e);
  }
}

/**
 * Delete a workflow
 */
export function deleteWorkflow(workflowId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const workflows = getAllWorkflows().filter(w => w.id !== workflowId);
    localStorage.setItem('sustainability-workflows', JSON.stringify(workflows));
    window.dispatchEvent(new CustomEvent('workflows-updated'));
  } catch (e) {
    console.error('Failed to delete workflow:', e);
  }
}

/**
 * Get workflow templates
 */
export function getWorkflowTemplates(allResources: ResourceMetadata[]): Workflow[] {
  const findTool = (slug: string): ResourceMetadata | undefined => {
    return allResources.find(r => r.slug === slug && r.category === 'tools');
  };

  return [
    {
      id: 'template-circular-product-design',
      title: 'Circular Product Design Workflow',
      description: 'A comprehensive workflow for designing circular products from ideation to implementation',
      isTemplate: true,
      tags: ['circular-economy', 'product-innovation', 'design'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        { slug: 'circular-canvas', notes: 'Map your circular business model and value flows' },
        { slug: 'impact-compass', notes: 'Assess environmental and social impacts' },
        { slug: 'cambridge-value-mapping-tool', notes: 'Map stakeholder value exchanges' },
      ]
        .map(({ slug, notes }) => {
          const tool = findTool(slug);
          if (!tool) return null;
          return {
            toolId: `tools/${slug}`,
            tool,
            notes,
            order: 0, // Will be set below
          };
        })
        .filter((step): step is NonNullable<typeof step> => step !== null)
        .map((step, index) => ({
          ...step,
          order: index + 1,
        })),
    },
    {
      id: 'template-social-impact-assessment',
      title: 'Social Impact Assessment Workflow',
      description: 'Evaluate and measure social impact of your innovation',
      isTemplate: true,
      tags: ['social-sustainability', 'assess', 'impact'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        { slug: 'social-impact-wheel', notes: 'Identify key social impact dimensions' },
        { slug: 'impact-gap-canvas', notes: 'Identify gaps between current and desired impact' },
        { slug: 'sdg-impact-assessment', notes: 'Assess alignment with UN Sustainable Development Goals' },
      ]
        .map(({ slug, notes }) => {
          const tool = findTool(slug);
          if (!tool) return null;
          return {
            toolId: `tools/${slug}`,
            tool,
            notes,
            order: 0,
          };
        })
        .filter((step): step is NonNullable<typeof step> => step !== null)
        .map((step, index) => ({
          ...step,
          order: index + 1,
        })),
    },
    {
      id: 'template-sustainable-business-model',
      title: 'Sustainable Business Model Design',
      description: 'Design and validate a sustainable business model',
      isTemplate: true,
      tags: ['business-model-innovation', 'strategy', 'align'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: [
        { slug: 'sustainable-business-model-canvas', notes: 'Design your sustainable business model' },
        { slug: 'triple-layered-business-model-canvas', notes: 'Add environmental and social layers to your model' },
        { slug: 'sustainability-swot-analysis', notes: 'Analyze strengths, weaknesses, opportunities, and threats' },
      ]
        .map(({ slug, notes }) => {
          const tool = findTool(slug);
          if (!tool) return null;
          return {
            toolId: `tools/${slug}`,
            tool,
            notes,
            order: 0,
          };
        })
        .filter((step): step is NonNullable<typeof step> => step !== null)
        .map((step, index) => ({
          ...step,
          order: index + 1,
        })),
    },
  ].filter(workflow => workflow.steps.length > 0);
}

/**
 * Generate a shareable link for a workflow
 */
export function generateWorkflowShareLink(workflowId: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/workflows/${workflowId}`;
}
