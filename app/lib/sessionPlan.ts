import type { ResourceMetadata } from './markdown';
import { getPrerequisitesForTool } from './prerequisites';

/**
 * Builds a running order for a facilitated session.
 *
 * This answers a question none of the other workflows do: not "which tool is
 * relevant" but "what can I actually run, with this group, at this level, in
 * what order". Educators are the target audience of 20 of the 28 tools and had
 * no entry point of their own.
 *
 * Everything here is derived from data the collection already carries. There
 * are no duration estimates in the corpus, so the planner never claims one;
 * it reports what each tool needs in place instead, which is the part a
 * facilitator cannot find out any other way.
 */

export type Audience =
  | 'students'
  | 'practitioners'
  | 'entrepreneurs'
  | 'corporations'
  | 'researchers';

export type Experience = 'new' | 'some';

export type GroupMode = 'individual' | 'small-groups' | 'whole-room';

export type Aim = 'map' | 'assess' | 'align';

export interface SessionBrief {
  audience: Audience;
  experience: Experience;
  groupMode: GroupMode;
  aim: Aim;
}

export interface PlannedStep {
  /** Where this sits in the session. */
  phase: 'Open' | 'Work' | 'Close';
  tool: ResourceMetadata;
  /** Why this tool, in one line. */
  rationale: string;
  skillLevel: string;
  /** What has to be in place before the group starts. */
  prerequisites: string[];
}

export interface SessionPlan {
  steps: PlannedStep[];
  /** Everything to prepare, across the whole session. */
  preparation: string[];
  /** Tools that fit the brief but did not make the running order. */
  alternatives: ResourceMetadata[];
  /** Set when the brief is too narrow to fill the running order. */
  shortfall?: string;
}

/** Collaboration tags that suit each way of working. */
const GROUP_TAGS: Record<GroupMode, string[]> = {
  individual: ['individual'],
  'small-groups': ['team', 'cross-team-collaboration'],
  'whole-room': ['community', 'team', 'cross-sector-partnerships'],
};

/**
 * The session runs in this order.
 *
 * Mapping before assessment gives the group something to assess; alignment
 * lands once there is something to align on. The same ordering the
 * compatibility scoring treats as complementary.
 */
const PHASE_ORDER: { phase: PlannedStep['phase']; objective: string }[] = [
  { phase: 'Open', objective: 'map' },
  { phase: 'Work', objective: 'assess' },
  { phase: 'Close', objective: 'align' },
];

const LEVEL_RANK: Record<string, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

const has = (tool: ResourceMetadata, tag: string) =>
  tool.tags.some(t => t.toLowerCase() === tag.toLowerCase());

/** The hardest level this group should be asked to handle. */
const ceilingFor = (experience: Experience) => (experience === 'new' ? 1 : 2);

function levelOf(tool: ResourceMetadata): string {
  return getPrerequisitesForTool(tool.slug)?.skillLevelRequired ?? 'beginner';
}

function prerequisitesOf(tool: ResourceMetadata): string[] {
  const record = getPrerequisitesForTool(tool.slug);
  if (!record) return [];
  return record.prerequisites.map(p => p.name);
}

/** How well a tool suits the brief, and why. */
function score(tool: ResourceMetadata, brief: SessionBrief): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  if (has(tool, brief.audience)) {
    score += 4;
    reasons.push(`written for ${brief.audience}`);
  }

  const groupTags = GROUP_TAGS[brief.groupMode];
  const matchedGroup = groupTags.find(t => has(tool, t));
  if (matchedGroup) {
    score += 3;
    reasons.push(
      brief.groupMode === 'individual' ? 'works solo' : `suits ${matchedGroup.replace(/-/g, ' ')} work`
    );
  }

  // The aim is the point of the session, so a tool that serves it outranks one
  // that merely fits the room.
  if (has(tool, brief.aim)) {
    score += 5;
    reasons.push(`built to ${brief.aim}`);
  }

  // Pitch to the room. A group with some background is short-changed by a
  // session of entry-level tools, so meeting the ceiling beats sitting under it.
  const rank = LEVEL_RANK[levelOf(tool)] ?? 1;
  if (rank === ceilingFor(brief.experience)) score += 3;
  else if (rank < ceilingFor(brief.experience)) score += 1;

  // Fewer things to arrange is an advantage, but only as a tie-break. Scoring
  // it heavily made the planner pick the shallowest tool every time and report
  // nothing to prepare, which is not advice.
  if (prerequisitesOf(tool).length === 0) {
    score += 1;
    reasons.push('nothing to prepare');
  }

  return { score, reasons };
}

export function buildSessionPlan(
  allResources: ResourceMetadata[],
  brief: SessionBrief
): SessionPlan {
  const ceiling = ceilingFor(brief.experience);

  const eligible = allResources
    .filter(r => r.category === 'tools')
    .filter(r => (LEVEL_RANK[levelOf(r)] ?? 1) <= ceiling)
    .filter(r => GROUP_TAGS[brief.groupMode].some(t => has(r, t)));

  const ranked = eligible
    .map(tool => ({ tool, ...score(tool, brief) }))
    .sort((a, b) => b.score - a.score || a.tool.title.localeCompare(b.tool.title));

  // Fill the running order, one tool per phase, never repeating a tool.
  // The aim's phase is chosen first so the centrepiece gets the best match and
  // the surrounding phases work around it, not the other way round.
  const used = new Set<string>();
  const steps: PlannedStep[] = [];
  const fillOrder = [
    ...PHASE_ORDER.filter(p => p.objective === brief.aim),
    ...PHASE_ORDER.filter(p => p.objective !== brief.aim),
  ];

  for (const { phase, objective } of fillOrder) {
    const candidate = ranked.find(r => !used.has(r.tool.slug) && has(r.tool, objective));
    if (!candidate) continue;

    used.add(candidate.tool.slug);
    const reasons = [...candidate.reasons];
    reasons.unshift(
      objective === 'map'
        ? 'opens by mapping the situation'
        : objective === 'assess'
          ? 'carries the assessment the group works through'
          : 'closes by turning findings into a direction'
    );

    steps.push({
      phase,
      tool: candidate.tool,
      rationale: reasons.slice(0, 3).join(', '),
      skillLevel: levelOf(candidate.tool),
      prerequisites: prerequisitesOf(candidate.tool),
    });
  }

  // Chosen out of order, presented in order.
  const phaseRank = (p: PlannedStep['phase']) => PHASE_ORDER.findIndex(x => x.phase === p);
  steps.sort((a, b) => phaseRank(a.phase) - phaseRank(b.phase));

  const preparation = [...new Set(steps.flatMap(s => s.prerequisites))];
  const alternatives = ranked
    .filter(r => !used.has(r.tool.slug))
    .slice(0, 4)
    .map(r => r.tool);

  let shortfall: string | undefined;
  if (steps.length === 0) {
    shortfall = 'No tool in the collection matches that combination. Try a different way of working, or allow more experience in the room.';
  } else if (steps.length < PHASE_ORDER.length) {
    const missing = PHASE_ORDER.filter(p => !steps.some(s => s.phase === p.phase)).map(p => p.phase.toLowerCase());
    shortfall = `No tool fits the ${missing.join(' or ')} phase under these constraints, so the session runs shorter.`;
  }

  return { steps, preparation, alternatives, shortfall };
}
