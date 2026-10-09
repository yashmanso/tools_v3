'use client';

/**
 * Facet vocabulary for the assistant.
 *
 * The site already describes every tool along twelve dimensions, each carrying
 * its own tags. The assistant reads a question against that same vocabulary
 * instead of a private keyword list, so what it understands and what the rest
 * of the site filters on cannot drift apart.
 */

export interface Facet {
  /** The tag as it appears on resources. */
  tag: string;
  /** Which dimension it belongs to, for grouping in the UI. */
  dimension: 'objective' | 'stage' | 'audience' | 'focus' | 'innovation' | 'method';
  /** Human-readable label. */
  label: string;
  /** Phrases that should resolve to this tag, lowercase. */
  synonyms: string[];
}

export const FACETS: Facet[] = [
  // --- objective -----------------------------------------------------------
  { tag: 'map', dimension: 'objective', label: 'mapping', synonyms: ['map', 'mapping', 'visualise', 'visualize', 'chart', 'diagram', 'understand', 'see the whole', 'overview of'] },
  { tag: 'assess', dimension: 'objective', label: 'assessment', synonyms: ['assess', 'assessment', 'evaluate', 'evaluation', 'measure', 'measuring', 'score', 'audit', 'analyse', 'analyze', 'benchmark', 'diagnose'] },
  { tag: 'report', dimension: 'objective', label: 'reporting', synonyms: ['report', 'reporting', 'document', 'disclose', 'disclosure', 'communicate', 'present', 'evidence'] },
  { tag: 'align', dimension: 'objective', label: 'alignment', synonyms: ['align', 'alignment', 'strategy', 'strategic', 'plan', 'planning', 'roadmap', 'goal', 'objectives', 'prioritise', 'prioritize'] },

  // --- stage ---------------------------------------------------------------
  { tag: 'ideation', dimension: 'stage', label: 'ideation', synonyms: ['ideation', 'idea', 'ideas', 'brainstorm', 'concept', 'early idea', 'exploring'] },
  { tag: 'design', dimension: 'stage', label: 'design', synonyms: ['design', 'designing', 'prototype', 'prototyping'] },
  { tag: 'development', dimension: 'stage', label: 'development', synonyms: ['development', 'developing', 'build', 'building'] },
  { tag: 'implementation', dimension: 'stage', label: 'implementation', synonyms: ['implementation', 'implement', 'rollout', 'roll out', 'deploy', 'put into practice'] },
  { tag: 'startup', dimension: 'stage', label: 'startup stage', synonyms: ['startup', 'start-up', 'start up', 'founding', 'founder', 'new venture', 'early stage', 'pre-seed', 'seed'] },
  { tag: 'growth', dimension: 'stage', label: 'growth', synonyms: ['growth', 'growing', 'expand', 'expanding', 'traction'] },
  { tag: 'scale-up', dimension: 'stage', label: 'scale-up', synonyms: ['scale-up', 'scale up', 'scaling', 'scale'] },
  { tag: 'maturity', dimension: 'stage', label: 'maturity', synonyms: ['maturity', 'mature', 'established', 'incumbent'] },

  // --- audience ------------------------------------------------------------
  { tag: 'entrepreneurs', dimension: 'audience', label: 'entrepreneurs', synonyms: ['entrepreneur', 'entrepreneurs', 'founders'] },
  { tag: 'researchers', dimension: 'audience', label: 'researchers', synonyms: ['researcher', 'researchers', 'research', 'academic', 'academics', 'phd', 'thesis'] },
  { tag: 'students', dimension: 'audience', label: 'students', synonyms: ['student', 'students', 'learner', 'learners', 'course', 'classroom'] },
  { tag: 'educators', dimension: 'audience', label: 'educators', synonyms: ['educator', 'educators', 'teacher', 'teaching', 'teach', 'lecturer', 'facilitator', 'facilitate', 'workshop', 'seminar', 'curriculum'] },
  { tag: 'practitioners', dimension: 'audience', label: 'practitioners', synonyms: ['practitioner', 'practitioners', 'consultant', 'consulting'] },
  { tag: 'startups', dimension: 'audience', label: 'startups', synonyms: ['startups', 'small team'] },
  { tag: 'SMEs', dimension: 'audience', label: 'SMEs', synonyms: ['sme', 'smes', 'small business', 'small and medium', 'small company'] },
  { tag: 'corporations', dimension: 'audience', label: 'corporations', synonyms: ['corporation', 'corporations', 'corporate', 'enterprise', 'large company'] },
  { tag: 'nonprofits', dimension: 'audience', label: 'nonprofits', synonyms: ['nonprofit', 'non-profit', 'ngo', 'charity', 'third sector'] },
  { tag: 'policy-makers', dimension: 'audience', label: 'policy makers', synonyms: ['policy', 'policy-maker', 'policymaker', 'public sector', 'government', 'municipality'] },

  // --- sustainability focus ------------------------------------------------
  { tag: 'circular-economy', dimension: 'focus', label: 'circular economy', synonyms: ['circular', 'circularity', 'circular economy', 'reuse', 'recycling', 'closed loop', 'waste'] },
  { tag: 'environmental-sustainability', dimension: 'focus', label: 'environmental sustainability', synonyms: ['environment', 'environmental', 'ecological', 'ecology', 'planet', 'green'] },
  { tag: 'social-sustainability', dimension: 'focus', label: 'social sustainability', synonyms: ['social sustainability', 'equity', 'inclusion', 'wellbeing', 'community'] },
  { tag: 'economic-sustainability', dimension: 'focus', label: 'economic sustainability', synonyms: ['economic', 'economics', 'profitability', 'viability', 'financial'] },
  { tag: 'SDGs', dimension: 'focus', label: 'the SDGs', synonyms: ['sdg', 'sdgs', 'sustainable development goals', 'global goals', 'agenda 2030'] },
  { tag: 'environmental-impact', dimension: 'focus', label: 'environmental impact', synonyms: ['environmental impact', 'footprint', 'carbon', 'emissions', 'co2', 'lca', 'life cycle'] },
  { tag: 'social-impact', dimension: 'focus', label: 'social impact', synonyms: ['social impact', 'impact on people', 'stakeholder impact'] },

  // --- innovation type -----------------------------------------------------
  { tag: 'business-model-innovation', dimension: 'innovation', label: 'business models', synonyms: ['business model', 'business models', 'revenue model', 'value proposition', 'canvas'] },
  { tag: 'product-innovation', dimension: 'innovation', label: 'product innovation', synonyms: ['product', 'products', 'physical product', 'goods'] },
  { tag: 'process-innovation', dimension: 'innovation', label: 'process innovation', synonyms: ['process', 'processes', 'operations', 'supply chain'] },
  { tag: 'social-innovation', dimension: 'innovation', label: 'social innovation', synonyms: ['social innovation', 'social venture'] },
  { tag: 'technological-innovation', dimension: 'innovation', label: 'technology', synonyms: ['technology', 'technological', 'tech', 'digital', 'software'] },

  // --- method --------------------------------------------------------------
  { tag: 'qualitative-research', dimension: 'method', label: 'qualitative methods', synonyms: ['qualitative', 'interviews', 'ethnography'] },
  { tag: 'quantitative-research', dimension: 'method', label: 'quantitative methods', synonyms: ['quantitative', 'statistics', 'numbers', 'metrics', 'kpi', 'kpis'] },
  { tag: 'mixed-methods', dimension: 'method', label: 'mixed methods', synonyms: ['mixed methods', 'mixed-method'] },
  { tag: 'theoretical-frameworks', dimension: 'method', label: 'frameworks', synonyms: ['framework', 'frameworks', 'theory', 'theoretical', 'model'] },
];

export const DIMENSION_LABELS: Record<Facet['dimension'], string> = {
  objective: 'Goal',
  stage: 'Stage',
  audience: 'For',
  focus: 'Focus',
  innovation: 'Type',
  method: 'Method',
};

/** Longest synonyms first, so "business model" wins over "model". */
const ORDERED = FACETS.flatMap(f => f.synonyms.map(s => ({ phrase: s, facet: f })))
  .sort((a, b) => b.phrase.length - a.phrase.length);

/** Pull every facet a sentence mentions. */
export function detectFacets(text: string): Facet[] {
  const haystack = ` ${text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ')} `;
  const found: Facet[] = [];
  let remaining = haystack;

  for (const { phrase, facet } of ORDERED) {
    if (found.some(f => f.tag === facet.tag)) continue;
    // Word-boundary match so "scale" does not fire inside "scaleable".
    const needle = ` ${phrase} `;
    if (remaining.includes(needle)) {
      found.push(facet);
      // Consume it so a shorter synonym cannot match the same words again.
      remaining = remaining.replace(needle, ' ');
    }
  }
  return found;
}

const STOPWORDS = new Set([
  'i', 'me', 'my', 'we', 'our', 'you', 'your', 'a', 'an', 'the', 'and', 'or', 'but', 'for', 'to',
  'of', 'in', 'on', 'at', 'with', 'about', 'is', 'am', 'are', 'was', 'be', 'been', 'do', 'does',
  'did', 'can', 'could', 'would', 'should', 'will', 'want', 'need', 'looking', 'look', 'find',
  'help', 'show', 'give', 'any', 'some', 'that', 'this', 'it', 'something', 'tool', 'tools',
  'please', 'how', 'what', 'which', 'where', 'when', 'who', 'there', 'have', 'has', 'get', 'use',
]);

/** Words left over after facets are removed - used for a free-text pass. */
export function freeTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w));
}
