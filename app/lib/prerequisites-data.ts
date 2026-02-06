import { Prerequisite, ToolPrerequisites } from './prerequisites';

/**
 * Comprehensive prerequisites data for all tools
 * This data is based on tool documentation and research
 */
export const TOOL_PREREQUISITES_DATA: Record<string, ToolPrerequisites> = {
  'circular-canvas': {
    toolSlug: 'circular-canvas',
    skillLevelRequired: 'beginner',
    prerequisites: [
      {
        type: 'tool',
        name: 'Sustainable Business Model Canvas',
        description: 'Basic understanding of business model components. The Sustainable Business Model Canvas provides a good foundation.',
        link: '/tools/sustainable-business-model-canvas',
        skillLevel: 'beginner',
      },
      {
        type: 'concept',
        name: 'Systems Thinking',
        description: 'Understanding of systems thinking principles helps in mapping complex relationships',
        skillLevel: 'beginner',
      },
      {
        type: 'concept',
        name: 'Circular Economy Principles',
        description: 'Familiarity with circular economy concepts enhances tool effectiveness',
        skillLevel: 'beginner',
      },
    ],
    notes: 'The tool is designed to be accessible, but basic business model knowledge is helpful.',
  },

  'biomimicry-design-spiral': {
    toolSlug: 'biomimicry-design-spiral',
    skillLevelRequired: 'beginner',
    prerequisites: [
      {
        type: 'concept',
        name: 'Design Principles',
        description: 'Basic understanding of design principles and methodologies',
        skillLevel: 'beginner',
      },
      {
        type: 'concept',
        name: 'Sustainability Fundamentals',
        description: 'Basic command of sustainability concepts and principles',
        skillLevel: 'beginner',
      },
      {
        type: 'concept',
        name: 'Biology Basics',
        description: 'Basic understanding of biological systems and natural processes',
        skillLevel: 'beginner',
      },
    ],
    notes: 'Works best with interdisciplinary teams that can bring diverse perspectives.',
  },

  'sustainable-business-model-canvas': {
    toolSlug: 'sustainable-business-model-canvas',
    skillLevelRequired: 'beginner',
    prerequisites: [
      {
        type: 'concept',
        name: 'Business Model Canvas',
        description: 'Familiarity with the traditional Business Model Canvas is helpful but not required',
        skillLevel: 'beginner',
      },
      {
        type: 'concept',
        name: 'Sustainability Concepts',
        description: 'Basic understanding of environmental and social sustainability',
        skillLevel: 'beginner',
      },
    ],
    notes: 'No specific prerequisites required to get started. Beginner-friendly. Consider this before using Triple Layered Business Model Canvas.',
  },

  'triple-layered-business-model-canvas': {
    toolSlug: 'triple-layered-business-model-canvas',
    skillLevelRequired: 'intermediate',
    prerequisites: [
      {
        type: 'tool',
        name: 'Sustainable Business Model Canvas',
        description: 'Prior understanding of business modeling concepts. Consider starting with the Sustainable Business Model Canvas first.',
        link: '/tools/sustainable-business-model-canvas',
        skillLevel: 'intermediate',
      },
      {
        type: 'concept',
        name: 'Environmental Impact Assessment',
        description: 'Basic grasp of environmental impact assessment methods',
        skillLevel: 'intermediate',
      },
      {
        type: 'concept',
        name: 'Social Impact Assessment',
        description: 'Understanding of social impact assessment approaches',
        skillLevel: 'intermediate',
      },
    ],
    notes: 'Builds upon the Business Model Canvas, adding environmental and social layers.',
  },

  'sdg-impact-assessment': {
    toolSlug: 'sdg-impact-assessment',
    skillLevelRequired: 'beginner',
    prerequisites: [
      {
        type: 'concept',
        name: 'UN Sustainable Development Goals',
        description: 'Basic understanding of the 17 SDGs and their targets',
        skillLevel: 'beginner',
      },
      {
        type: 'concept',
        name: 'Impact Assessment',
        description: 'Familiarity with impact assessment concepts helps in effective use',
        skillLevel: 'beginner',
      },
    ],
    notes: 'Designed to be accessible, but SDG knowledge enhances effectiveness.',
  },

  'cambridge-value-mapping-tool': {
    toolSlug: 'cambridge-value-mapping-tool',
    skillLevelRequired: 'beginner',
    prerequisites: [
      {
        type: 'concept',
        name: 'Stakeholder Analysis',
        description: 'Basic understanding of stakeholder relationships and value exchanges',
        skillLevel: 'beginner',
      },
    ],
    notes: 'Accessible to wide audience with no specific prerequisites needed.',
  },

  'sustainability-assessment-of-startups': {
    toolSlug: 'sustainability-assessment-of-startups',
    skillLevelRequired: 'intermediate',
    prerequisites: [
      {
        type: 'concept',
        name: 'Business Fundamentals',
        description: 'Basic understanding of business operations and startup dynamics',
        skillLevel: 'intermediate',
      },
      {
        type: 'concept',
        name: 'Sustainability Concepts',
        description: 'Knowledge of sustainability principles and assessment methods',
        skillLevel: 'intermediate',
      },
    ],
    notes: 'Designed for users with business and sustainability knowledge.',
  },

  'impact-compass': {
    toolSlug: 'impact-compass',
    skillLevelRequired: 'intermediate',
    prerequisites: [
      {
        type: 'concept',
        name: 'Impact Assessment',
        description: 'Intermediate understanding of impact assessment methodologies',
        skillLevel: 'intermediate',
      },
      {
        type: 'concept',
        name: 'Social Innovation',
        description: 'Good understanding of social innovation concepts',
        skillLevel: 'intermediate',
      },
      {
        type: 'concept',
        name: 'Six Dimensions Framework',
        description: 'Understanding of how the six dimensions can be diligently graded',
        skillLevel: 'intermediate',
      },
    ],
    notes: 'Requires intermediate level understanding to utilize effectively.',
  },

  'circular-business-model-planning-tool': {
    toolSlug: 'circular-business-model-planning-tool',
    skillLevelRequired: 'beginner',
    prerequisites: [
      {
        type: 'concept',
        name: 'Business Models',
        description: 'Basic understanding of business model concepts',
        skillLevel: 'beginner',
      },
      {
        type: 'concept',
        name: 'Circular Economy',
        description: 'Knowledge of circular economy principles and concepts',
        skillLevel: 'beginner',
      },
    ],
    notes: 'Basic business and sustainability knowledge recommended.',
  },

  'sustainability-swot-analysis': {
    toolSlug: 'sustainability-swot-analysis',
    skillLevelRequired: 'beginner',
    prerequisites: [
      {
        type: 'concept',
        name: 'SWOT Analysis',
        description: 'General knowledge of SWOT analysis concepts (Strengths, Weaknesses, Opportunities, Threats)',
        skillLevel: 'beginner',
      },
    ],
    notes: 'SWOT knowledge is useful but not strictly required.',
  },

  'resource-wheel': {
    toolSlug: 'resource-wheel',
    skillLevelRequired: 'intermediate',
    prerequisites: [
      {
        type: 'concept',
        name: 'Sustainability Concepts',
        description: 'Some level of familiarity with sustainability concepts',
        skillLevel: 'intermediate',
      },
      {
        type: 'concept',
        name: 'Resource Management',
        description: 'Understanding of resource flows and management',
        skillLevel: 'intermediate',
      },
    ],
    notes: 'Designed for organizations with sustainability familiarity.',
  },

  'social-impact-wheel': {
    toolSlug: 'social-impact-wheel',
    skillLevelRequired: 'beginner',
    prerequisites: [],
    notes: 'No specific prerequisites required. Accessible to wide range of users.',
  },

  'sustainability-balanced-scorecard': {
    toolSlug: 'sustainability-balanced-scorecard',
    skillLevelRequired: 'intermediate',
    prerequisites: [
      {
        type: 'concept',
        name: 'Strategic Management',
        description: 'Certain level of strategic management knowledge required',
        skillLevel: 'intermediate',
      },
      {
        type: 'concept',
        name: 'Sustainability Concepts',
        description: 'Familiarity with sustainability concepts and frameworks',
        skillLevel: 'intermediate',
      },
      {
        type: 'concept',
        name: 'Balanced Scorecard',
        description: 'Understanding of traditional Balanced Scorecard methodology',
        skillLevel: 'intermediate',
      },
    ],
    notes: 'Requires strategic management and sustainability knowledge.',
  },

  'ucd-impact-journey': {
    toolSlug: 'ucd-impact-journey',
    skillLevelRequired: 'intermediate',
    prerequisites: [
      {
        type: 'concept',
        name: 'Research Processes',
        description: 'Intermediate level understanding of research processes',
        skillLevel: 'intermediate',
      },
      {
        type: 'concept',
        name: 'Impact Planning',
        description: 'Knowledge of impact planning methodologies',
        skillLevel: 'intermediate',
      },
    ],
    notes: 'Designed for users with research and impact planning experience.',
  },

  'ucd-impact-planning-canvas': {
    toolSlug: 'ucd-impact-planning-canvas',
    skillLevelRequired: 'beginner',
    prerequisites: [],
    notes: 'User-friendly with no specific educational background required.',
  },

  'impact-gap-canvas': {
    toolSlug: 'impact-gap-canvas',
    skillLevelRequired: 'beginner',
    prerequisites: [],
    notes: 'Accessible to wide range of users with no specific prerequisites.',
  },

  'project-resilience-review': {
    toolSlug: 'project-resilience-review',
    skillLevelRequired: 'intermediate',
    prerequisites: [
      {
        type: 'concept',
        name: 'Sustainability Concepts',
        description: 'Basic understanding of sustainability concepts',
        skillLevel: 'intermediate',
      },
      {
        type: 'concept',
        name: 'Project Management',
        description: 'Knowledge of project management principles and practices',
        skillLevel: 'intermediate',
      },
    ],
    notes: 'Requires sustainability and project management knowledge.',
  },

  'responsible-tech-playbook': {
    toolSlug: 'responsible-tech-playbook',
    skillLevelRequired: 'beginner',
    prerequisites: [],
    notes: 'Designed to be accessible with no specific prerequisites.',
  },

  'future-fit-business-benchmark': {
    toolSlug: 'future-fit-business-benchmark',
    skillLevelRequired: 'intermediate',
    prerequisites: [
      {
        type: 'concept',
        name: 'Business Fundamentals',
        description: 'Foundational knowledge in business operations',
        skillLevel: 'intermediate',
      },
      {
        type: 'concept',
        name: 'Sustainability Concepts',
        description: 'Understanding of sustainability principles',
        skillLevel: 'intermediate',
      },
    ],
    notes: 'Best utilized by those with business and sustainability knowledge.',
  },

  'biomimicards-game': {
    toolSlug: 'biomimicards-game',
    skillLevelRequired: 'beginner',
    prerequisites: [],
    notes: 'Accessible to all with no specific prior knowledge required.',
  },

  'sustainability-impact-canvas': {
    toolSlug: 'sustainability-impact-canvas',
    skillLevelRequired: 'beginner',
    prerequisites: [],
    notes: 'No specific prerequisites required. Accessible to wide range of users.',
  },

  'circular-design-toolkit': {
    toolSlug: 'circular-design-toolkit',
    skillLevelRequired: 'beginner',
    prerequisites: [],
    notes: 'Accessible to wide audience with no specific prerequisites.',
  },

  'use2use-design-tools': {
    toolSlug: 'use2use-design-tools',
    skillLevelRequired: 'intermediate',
    prerequisites: [
      {
        type: 'concept',
        name: 'Design Principles',
        description: 'Basic understanding of design concepts and methodologies',
        skillLevel: 'intermediate',
      },
      {
        type: 'concept',
        name: 'Sustainability Concepts',
        description: 'Knowledge of sustainability principles in design context',
        skillLevel: 'intermediate',
      },
    ],
    notes: 'Designed for professionals with design and sustainability knowledge.',
  },

  'ecodesign-strategy-wheel': {
    toolSlug: 'ecodesign-strategy-wheel',
    skillLevelRequired: 'beginner',
    prerequisites: [
      {
        type: 'concept',
        name: 'Ecodesign Principles',
        description: 'Basic knowledge about ecodesign principles and strategies',
        skillLevel: 'beginner',
      },
    ],
    notes: 'Requires some basic ecodesign knowledge.',
  },

  'sustainable-value-analysis-tool-svat': {
    toolSlug: 'sustainable-value-analysis-tool-svat',
    skillLevelRequired: 'intermediate',
    prerequisites: [
      {
        type: 'concept',
        name: 'Life Cycle Analysis',
        description: 'Intermediate understanding of life cycle analysis (LCA)',
        skillLevel: 'intermediate',
      },
      {
        type: 'concept',
        name: 'Sustainability in Business',
        description: 'Understanding of sustainability concepts in business context',
        skillLevel: 'intermediate',
      },
    ],
    notes: 'Requires intermediate level understanding of LCA and sustainability.',
  },

  'circularstart': {
    toolSlug: 'circularstart',
    skillLevelRequired: 'beginner',
    prerequisites: [],
    notes: 'Most tools accessible with no prerequisites, some may require basic business/sustainability knowledge.',
  },

  'social-impact-explanatory-cards': {
    toolSlug: 'social-impact-explanatory-cards',
    skillLevelRequired: 'beginner',
    prerequisites: [],
    notes: 'Designed to be accessible with no specific prerequisites required.',
  },

  'flourishing-business-canvas': {
    toolSlug: 'flourishing-business-canvas',
    skillLevelRequired: 'beginner',
    prerequisites: [
      {
        type: 'concept',
        name: 'Business Fundamentals',
        description: 'Basic understanding of business and sustainability is desired',
        skillLevel: 'beginner',
      },
    ],
    notes: 'Basic business and sustainability understanding recommended.',
  },
};
