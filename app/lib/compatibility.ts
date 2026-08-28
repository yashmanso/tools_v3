import { ResourceMetadata } from './markdown';

export type CompatibilityLevel = 'high' | 'medium' | 'low';

export interface CompatibilityResult {
  tool: ResourceMetadata;
  score: number; // 0-100, used for ranking only - never shown as a precise figure
  level: CompatibilityLevel;
  relationship: 'complementary' | 'overlap' | 'neutral';
  /** One specific sentence explaining the pairing. */
  summary: string;
  sharedTags: string[];
}

/**
 * Assign high/medium/low by rank within a single result list.
 *
 * Raw scores sit in a very narrow band (roughly 60-82 across the whole
 * corpus, and often within a few points of each other on one page), so an
 * absolute cut-off puts every card in the same bucket and tells the reader
 * nothing. Ranking within the list keeps the label meaningful: it says
 * "these are the strongest matches for this tool", which is the actual
 * question. Expects `results` already sorted best-first.
 */
function assignLevels(results: CompatibilityResult[]): CompatibilityResult[] {
  const n = results.length;
  if (n === 0) return results;
  // With very few results a three-way split is noise; call them all high.
  if (n < 3) return results.map(r => ({ ...r, level: 'high' as CompatibilityLevel }));

  const highCut = Math.ceil(n / 3);
  const mediumCut = Math.ceil((n * 2) / 3);
  return results.map((r, i) => ({
    ...r,
    level: (i < highCut ? 'high' : i < mediumCut ? 'medium' : 'low') as CompatibilityLevel,
  }));
}

// Readable nouns for the objective tags
const OBJECTIVE_NOUNS: Record<string, string> = {
  map: 'mapping',
  assess: 'assessment',
  report: 'reporting',
  align: 'strategic alignment',
};

// Readable labels for innovation-type tags
const INNOVATION_LABELS: Record<string, string> = {
  'product-innovation': 'product innovation',
  'process-innovation': 'process innovation',
  'business-model-innovation': 'business model',
  'social-innovation': 'social innovation',
  'technological-innovation': 'technological',
};

// Readable labels for sustainability focus tags
const FOCUS_LABELS: Record<string, string> = {
  'environmental-sustainability': 'environmental sustainability',
  'social-sustainability': 'social sustainability',
  'economic-sustainability': 'economic sustainability',
  'circular-economy': 'circular economy',
  'SDGs': 'the SDGs',
  'environmental-impact': 'environmental impact',
  'social-impact': 'social impact',
};

export interface CompatibilityAnalysis {
  selectedTools: ResourceMetadata[];
  complementaryTools: CompatibilityResult[];
  overlappingTools: CompatibilityResult[];
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

/**
 * Build one specific sentence describing how `tool2` relates to `tool1`.
 *
 * Deliberately names the actual objectives, focus areas or stages involved.
 * A generic line like "tools work well in sequence" applied to virtually
 * every pair in the corpus and told the reader nothing.
 */
function buildSummary(
  relationship: 'complementary' | 'overlap' | 'neutral',
  opts: {
    objectives1: string[];
    objectives2: string[];
    stages1: string[];
    stages2: string[];
    focus1: string[];
    focus2: string[];
    innovation1: string[];
    innovation2: string[];
    sharedTags: string[];
    tagOverlap: number;
  }
): string {
  const {
    objectives1, objectives2, stages1, stages2,
    focus1, focus2, innovation1, innovation2, sharedTags, tagOverlap,
  } = opts;

  // What this candidate brings that the current tool does not already cover.
  // Without it every card with the same objective pairing reads identically.
  const distinctiveFocus = focus2.find(f => !focus1.includes(f));
  const distinctiveInnovation = innovation2.find(i => !innovation1.includes(i));
  const distinctiveStage = stages2.find(s => !stages1.includes(s));

  const tail = distinctiveFocus
    ? `, bringing ${FOCUS_LABELS[distinctiveFocus] ?? distinctiveFocus} into view`
    : distinctiveInnovation
      ? `, from a ${(INNOVATION_LABELS[distinctiveInnovation] ?? distinctiveInnovation)} angle`
      : distinctiveStage
        ? `, and also reaches the ${distinctiveStage} stage`
        : '';

  if (relationship === 'overlap') {
    const sharedObjective = objectives1.find(o => objectives2.includes(o));
    if (sharedObjective) {
      return `Also focused on ${OBJECTIVE_NOUNS[sharedObjective] ?? sharedObjective}, and shares ${Math.round(tagOverlap * 100)}% of its tags — you likely only need one of the two.`;
    }
    return `Covers much the same ground, sharing ${Math.round(tagOverlap * 100)}% of its tags — you likely only need one of the two.`;
  }

  // Complementary: prefer the most specific thing we can say.
  const pairedObjective = objectives2.find(o2 =>
    objectives1.some(o1 => COMPLEMENTARY_PAIRS[o1]?.includes(o2))
  );
  const ownObjective = pairedObjective
    ? objectives1.find(o1 => COMPLEMENTARY_PAIRS[o1]?.includes(pairedObjective))
    : undefined;

  if (pairedObjective && ownObjective) {
    return `Adds ${OBJECTIVE_NOUNS[pairedObjective] ?? pairedObjective} to the ${OBJECTIVE_NOUNS[ownObjective] ?? ownObjective} this tool provides${tail}.`;
  }

  const pairedFocus = focus2.find(f2 =>
    focus1.some(f1 => COMPLEMENTARY_PAIRS[f1]?.includes(f2))
  );
  if (pairedFocus) {
    return `Extends this tool's scope into ${FOCUS_LABELS[pairedFocus] ?? pairedFocus}${tail}.`;
  }

  if (distinctiveStage) {
    return `Carries the work into the ${distinctiveStage} stage, which this tool does not cover.`;
  }

  const sharedFocus = focus1.find(f => focus2.includes(f));
  if (sharedFocus) {
    return `Approaches ${FOCUS_LABELS[sharedFocus] ?? sharedFocus} from a different angle${tail}.`;
  }

  if (sharedTags.length > 0) {
    return `Works on similar ground, sharing ${sharedTags.length} tag${sharedTags.length === 1 ? '' : 's'} with this tool${tail}.`;
  }

  return `Complements this tool without duplicating what it does${tail}.`;
}

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

  // Get innovation type
  const tool1Innovation = tool1.tags.filter(tag => DIMENSION_CATEGORIES.innovationType.includes(tag));
  const tool2Innovation = tool2.tags.filter(tag => DIMENSION_CATEGORIES.innovationType.includes(tag));

  // Check for complementary relationships
  let relationship: 'complementary' | 'overlap' | 'neutral' = 'neutral';

  const hasSameObjective = tool1Objectives.length > 0 && tool2Objectives.length > 0 &&
    tool1Objectives.some(obj => tool2Objectives.includes(obj));
  const hasSameStage = tool1Stages.length > 0 && tool2Stages.length > 0 &&
    tool1Stages.some(stage => tool2Stages.includes(stage));
  const highOverlap = tagOverlap > 0.7;

  if (hasSameObjective && highOverlap) {
    relationship = 'overlap';
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
    } else if (tagOverlap > 0.3) {
      relationship = 'overlap';
    }
  }

  // Calculate score (0-100)
  let score = tagOverlap * 50; // Base score from overlap

  if (relationship === 'complementary') {
    score += 30; // Bonus for complementary
  } else if (relationship === 'overlap') {
    score -= 20; // Penalty for overlap
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
    // Placeholder - replaced by assignLevels() once the list is ranked.
    level: 'medium',
    relationship,
    summary: buildSummary(relationship, {
      objectives1: tool1Objectives,
      objectives2: tool2Objectives,
      stages1: tool1Stages,
      stages2: tool2Stages,
      focus1: tool1Focus,
      focus2: tool2Focus,
      innovation1: tool1Innovation,
      innovation2: tool2Innovation,
      sharedTags,
      tagOverlap,
    }),
    sharedTags,
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
      recommendations: [],
    };
  }

  // Filter out selected tools from analysis
  const selectedSlugs = new Set(selectedTools.map(t => t.slug));
  const otherTools = allTools.filter(t => !selectedSlugs.has(t.slug));

  const complementaryTools: CompatibilityResult[] = [];
  const overlappingTools: CompatibilityResult[] = [];

  // Analyze compatibility with each other tool
  otherTools.forEach(otherTool => {
    // Calculate average compatibility with all selected tools
    const compatibilities = selectedTools.map(selectedTool =>
      calculateCompatibilityScore(selectedTool, otherTool)
    );

    const avgScore = compatibilities.reduce((sum, c) => sum + c.score, 0) / compatibilities.length;
    const relationships = compatibilities.map(c => c.relationship);
    const allSharedTags = new Set(compatibilities.flatMap(c => c.sharedTags));

    // Determine overall relationship
    let overallRelationship: 'complementary' | 'overlap' | 'neutral' = 'neutral';
    if (relationships.some(r => r === 'complementary')) {
      overallRelationship = 'complementary';
    } else if (relationships.some(r => r === 'overlap')) {
      overallRelationship = 'overlap';
    }

    // Describe the pairing against whichever selected tool it relates to most
    // strongly, so the sentence stays specific instead of averaging into mush.
    const best = compatibilities
      .filter(c => c.relationship === overallRelationship)
      .sort((a, b) => b.score - a.score)[0] ?? compatibilities[0];

    const result: CompatibilityResult = {
      tool: otherTool,
      score: avgScore,
      level: 'medium', // set by assignLevels() below, once ranked
      relationship: overallRelationship,
      summary: best.summary,
      sharedTags: Array.from(allSharedTags),
    };

    if (overallRelationship === 'complementary') {
      complementaryTools.push(result);
    } else if (overallRelationship === 'overlap') {
      overlappingTools.push(result);
    }
  });

  // Sort by score
  complementaryTools.sort((a, b) => b.score - a.score);
  overlappingTools.sort((a, b) => b.score - a.score);

  // Generate recommendations
  const recommendations: string[] = [];

  if (overlappingTools.length > 0) {
    recommendations.push(`${overlappingTools.length} tool(s) have significant overlap`);
  }

  if (complementaryTools.length > 0) {
    recommendations.push(`${complementaryTools.length} complementary tool(s) found`);
  }

  // Flag redundancy between the tools the user has already picked
  for (let i = 0; i < selectedTools.length; i++) {
    for (let j = i + 1; j < selectedTools.length; j++) {
      const compat = calculateCompatibilityScore(selectedTools[i], selectedTools[j]);
      if (compat.relationship === 'overlap') {
        recommendations.push(`Overlap: "${selectedTools[i].title}" and "${selectedTools[j].title}" have similar functionality`);
      }
    }
  }

  return {
    selectedTools,
    // Rank first, then label - levels are relative to what is actually shown.
    complementaryTools: assignLevels(complementaryTools.slice(0, 10)),
    overlappingTools: assignLevels(overlappingTools.slice(0, 5)),
    recommendations,
  };
}
