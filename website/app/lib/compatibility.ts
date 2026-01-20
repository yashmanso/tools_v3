import { ResourceMetadata } from './markdown';

export interface CompatibilityResult {
  tool: ResourceMetadata;
  score: number; // 0-100, higher = more compatible
  relationship: 'complementary' | 'overlap' | 'conflict' | 'neutral';
  reasons: string[];
  sharedTags: string[];
  conflictingTags: string[];
}

export interface CompatibilityAnalysis {
  selectedTools: ResourceMetadata[];
  complementaryTools: CompatibilityResult[];
  overlappingTools: CompatibilityResult[];
  conflictingTools: CompatibilityResult[];
  recommendations: string[];
}

// Dimension categories for compatibility analysis
const DIMENSION_CATEGORIES = {
  objective: ['map', 'assess', 'report', 'align'],
  targetAudience: ['entrepreneurs', 'researchers', 'students', 'educators', 'practitioners', 'startups', 'SMEs', 'corporations', 'nonprofits', 'policy-makers'],
  sustainabilityFocus: ['environmental-sustainability', 'social-sustainability', 'economic-sustainability', 'circular-economy', 'SDGs', 'environmental-impact', 'social-impact'],
  innovationType: ['product-innovation', 'process-innovation', 'business-model-innovation', 'social-innovation', 'technological-innovation'],
  entrepreneurshipStage: ['ideation', 'design', 'development', 'implementation', 'startup', 'growth', 'scale-up', 'maturity'],
  methodologicalApproach: ['qualitative-research', 'quantitative-research', 'mixed-methods', 'experimental-design', 'theoretical-frameworks'],
};

// Complementary tag pairs (tools that work well together)
const COMPLEMENTARY_PAIRS: Record<string, string[]> = {
  'map': ['assess', 'report'],
  'assess': ['map', 'report', 'align'],
  'ideation': ['design', 'development'],
  'design': ['development', 'implementation'],
  'development': ['implementation'],
  'circular-economy': ['environmental-sustainability', 'economic-sustainability'],
  'social-impact': ['social-sustainability'],
  'environmental-impact': ['environmental-sustainability'],
};

// Conflicting tag pairs (tools that might overlap too much)
const CONFLICTING_PAIRS: Record<string, string[]> = {
  'qualitative-research': ['quantitative-research'],
  'theoretical-frameworks': ['experimental-design'],
};

/**
 * Calculate compatibility score between two tools
 */
function calculateCompatibilityScore(
  tool1: ResourceMetadata,
  tool2: ResourceMetadata
): CompatibilityResult {
  const sharedTags = tool1.tags.filter(tag => tool2.tags.includes(tag));
  const allTags = new Set([...tool1.tags, ...tool2.tags]);
  const tagOverlap = sharedTags.length / allTags.size;

  // Get objectives
  const tool1Objectives = tool1.tags.filter(tag => DIMENSION_CATEGORIES.objective.includes(tag));
  const tool2Objectives = tool2.tags.filter(tag => DIMENSION_CATEGORIES.objective.includes(tag));

  // Get stages
  const tool1Stages = tool1.tags.filter(tag => DIMENSION_CATEGORIES.entrepreneurshipStage.includes(tag));
  const tool2Stages = tool2.tags.filter(tag => DIMENSION_CATEGORIES.entrepreneurshipStage.includes(tag));

  // Get sustainability focus
  const tool1Focus = tool1.tags.filter(tag => DIMENSION_CATEGORIES.sustainabilityFocus.includes(tag));
  const tool2Focus = tool2.tags.filter(tag => DIMENSION_CATEGORIES.sustainabilityFocus.includes(tag));

  // Check for complementary relationships
  let relationship: 'complementary' | 'overlap' | 'conflict' | 'neutral' = 'neutral';
  const reasons: string[] = [];
  const conflictingTags: string[] = [];

  // Check for conflicts (same objective, same stage, very high overlap)
  const hasSameObjective = tool1Objectives.length > 0 && tool2Objectives.length > 0 && 
    tool1Objectives.some(obj => tool2Objectives.includes(obj));
  const hasSameStage = tool1Stages.length > 0 && tool2Stages.length > 0 &&
    tool1Stages.some(stage => tool2Stages.includes(stage));
  const highOverlap = tagOverlap > 0.7;

  if (hasSameObjective && hasSameStage && highOverlap) {
    relationship = 'conflict';
    reasons.push('Both tools serve the same objective at the same stage');
    reasons.push(`High tag overlap (${Math.round(tagOverlap * 100)}%)`);
  } else if (hasSameObjective && highOverlap) {
    relationship = 'overlap';
    reasons.push('Both tools serve similar objectives');
    reasons.push(`Significant tag overlap (${Math.round(tagOverlap * 100)}%)`);
  } else {
    // Check for complementary relationships
    const hasComplementaryObjectives = tool1Objectives.some(obj1 => 
      COMPLEMENTARY_PAIRS[obj1]?.some(comp => tool2Objectives.includes(comp))
    ) || tool2Objectives.some(obj2 =>
      COMPLEMENTARY_PAIRS[obj2]?.some(comp => tool1Objectives.includes(comp))
    );

    const hasSequentialStages = tool1Stages.length > 0 && tool2Stages.length > 0 &&
      (tool1Stages.some(s1 => {
        const stageOrder = ['ideation', 'design', 'development', 'implementation', 'startup', 'growth', 'scale-up', 'maturity'];
        const s1Index = stageOrder.indexOf(s1);
        return tool2Stages.some(s2 => {
          const s2Index = stageOrder.indexOf(s2);
          return Math.abs(s1Index - s2Index) === 1;
        });
      }));

    const hasComplementaryFocus = tool1Focus.length > 0 && tool2Focus.length > 0 &&
      tool1Focus.some(f1 => COMPLEMENTARY_PAIRS[f1]?.some(comp => tool2Focus.includes(comp)));

    if (hasComplementaryObjectives || hasSequentialStages || hasComplementaryFocus) {
      relationship = 'complementary';
      if (hasComplementaryObjectives) reasons.push('Tools have complementary objectives');
      if (hasSequentialStages) reasons.push('Tools work well in sequence');
      if (hasComplementaryFocus) reasons.push('Tools address complementary sustainability aspects');
    } else if (tagOverlap > 0.3) {
      relationship = 'overlap';
      reasons.push('Significant tag overlap suggests similar functionality');
    }
  }

  // Check for conflicting tags
  tool1.tags.forEach(tag1 => {
    if (CONFLICTING_PAIRS[tag1]?.some(conflict => tool2.tags.includes(conflict))) {
      conflictingTags.push(tag1);
    }
  });

  if (conflictingTags.length > 0) {
    relationship = 'conflict';
    reasons.push(`Conflicting methodological approaches: ${conflictingTags.join(', ')}`);
  }

  // Calculate score (0-100)
  let score = tagOverlap * 50; // Base score from overlap

  if (relationship === 'complementary') {
    score += 30; // Bonus for complementary
  } else if (relationship === 'overlap') {
    score -= 20; // Penalty for overlap
  } else if (relationship === 'conflict') {
    score -= 40; // Penalty for conflict
  }

  // Bonus for shared sustainability focus
  if (sharedTags.some(tag => DIMENSION_CATEGORIES.sustainabilityFocus.includes(tag))) {
    score += 10;
  }

  // Bonus for shared target audience
  if (sharedTags.some(tag => DIMENSION_CATEGORIES.targetAudience.includes(tag))) {
    score += 10;
  }

  score = Math.max(0, Math.min(100, score));

  return {
    tool: tool2,
    score,
    relationship,
    reasons,
    sharedTags,
    conflictingTags,
  };
}

/**
 * Analyze compatibility for selected tools
 */
export function analyzeCompatibility(
  selectedTools: ResourceMetadata[],
  allTools: ResourceMetadata[]
): CompatibilityAnalysis {
  if (selectedTools.length === 0) {
    return {
      selectedTools: [],
      complementaryTools: [],
      overlappingTools: [],
      conflictingTools: [],
      recommendations: [],
    };
  }

  // Filter out selected tools from analysis
  const selectedSlugs = new Set(selectedTools.map(t => t.slug));
  const otherTools = allTools.filter(t => !selectedSlugs.has(t.slug));

  const complementaryTools: CompatibilityResult[] = [];
  const overlappingTools: CompatibilityResult[] = [];
  const conflictingTools: CompatibilityResult[] = [];

  // Analyze compatibility with each other tool
  otherTools.forEach(otherTool => {
    // Calculate average compatibility with all selected tools
    const compatibilities = selectedTools.map(selectedTool =>
      calculateCompatibilityScore(selectedTool, otherTool)
    );

    const avgScore = compatibilities.reduce((sum, c) => sum + c.score, 0) / compatibilities.length;
    const relationships = compatibilities.map(c => c.relationship);
    const allReasons = compatibilities.flatMap(c => c.reasons);
    const allSharedTags = new Set(compatibilities.flatMap(c => c.sharedTags));
    const allConflictingTags = new Set(compatibilities.flatMap(c => c.conflictingTags));

    // Determine overall relationship
    let overallRelationship: 'complementary' | 'overlap' | 'conflict' | 'neutral' = 'neutral';
    if (relationships.some(r => r === 'conflict')) {
      overallRelationship = 'conflict';
    } else if (relationships.some(r => r === 'complementary')) {
      overallRelationship = 'complementary';
    } else if (relationships.some(r => r === 'overlap')) {
      overallRelationship = 'overlap';
    }

    const result: CompatibilityResult = {
      tool: otherTool,
      score: avgScore,
      relationship: overallRelationship,
      reasons: Array.from(new Set(allReasons)),
      sharedTags: Array.from(allSharedTags),
      conflictingTags: Array.from(allConflictingTags),
    };

    if (overallRelationship === 'complementary') {
      complementaryTools.push(result);
    } else if (overallRelationship === 'overlap') {
      overlappingTools.push(result);
    } else if (overallRelationship === 'conflict') {
      conflictingTools.push(result);
    }
  });

  // Sort by score
  complementaryTools.sort((a, b) => b.score - a.score);
  overlappingTools.sort((a, b) => b.score - a.score);
  conflictingTools.sort((a, b) => a.score - b.score);

  // Generate recommendations
  const recommendations: string[] = [];

  if (conflictingTools.length > 0) {
    recommendations.push(`⚠️ Warning: ${conflictingTools.length} tool(s) may conflict with your selection`);
  }

  if (overlappingTools.length > 0) {
    recommendations.push(`ℹ️ Note: ${overlappingTools.length} tool(s) have significant overlap`);
  }

  if (complementaryTools.length > 0) {
    recommendations.push(`✓ ${complementaryTools.length} complementary tool(s) found`);
  }

  // Check for internal conflicts within selected tools
  for (let i = 0; i < selectedTools.length; i++) {
    for (let j = i + 1; j < selectedTools.length; j++) {
      const compat = calculateCompatibilityScore(selectedTools[i], selectedTools[j]);
      if (compat.relationship === 'conflict') {
        recommendations.push(`⚠️ Conflict detected: "${selectedTools[i].title}" and "${selectedTools[j].title}" may overlap too much`);
      } else if (compat.relationship === 'overlap') {
        recommendations.push(`ℹ️ Overlap: "${selectedTools[i].title}" and "${selectedTools[j].title}" have similar functionality`);
      }
    }
  }

  return {
    selectedTools,
    complementaryTools: complementaryTools.slice(0, 10), // Top 10
    overlappingTools: overlappingTools.slice(0, 5), // Top 5
    conflictingTools: conflictingTools.slice(0, 5), // Top 5
    recommendations,
  };
}
