/**
 * The guided tour, as a sequence of captured screens.
 *
 * One screen per feature — a workflow gets a single screen with its steps
 * described in the caption, rather than a screen per step. A tour is
 * orientation, not a manual.
 *
 * `target` is the element the caption is about. The capture script resolves it,
 * records its position, and refuses to capture if it is not in frame; the tour
 * draws a ring at that position. So every caption points at something specific,
 * and a step whose screen does not actually contain its subject fails the
 * capture instead of shipping.
 *
 * Screens are captured by `npm run tour:shots`. They do not update themselves —
 * re-run it after changing any screen shown here.
 */

import hotspots from './tourHotspots.json';

export interface TourStep {
  /** Matches the capture recipe, the image filename and the hotspot key. */
  id: string;
  chapter: string;
  title: string;
  body: string;
  /**
   * Playwright selector for the element the caption describes. Omitted for
   * screens about the page as a whole.
   */
  target?: string;
}

/** Normalised 0-1 box of a step's target within its screen. */
export interface Hotspot {
  x: number;
  y: number;
  w: number;
  h: number;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    chapter: 'Welcome',
    title: 'Welcome to the Sustainability Atlas',
    body: '28 tools, 20 collections and 16 articles for sustainable innovation work, all described the same way so they can be compared. This is a quick look at what is here. Space or the arrow keys move; Esc leaves.',
  },
  {
    id: 'hub',
    chapter: 'Getting around',
    title: 'Nine ways to explore',
    body: 'People arrive knowing different things, so there is no single front door. Browse if you want the shape of the collection, answer questions if you know your situation but not the vocabulary, or go straight to your stage of the innovation journey.',
    target: '[data-tour="explore-hub"]',
  },
  {
    id: 'menu',
    chapter: 'Getting around',
    title: 'Every workflow, from anywhere',
    body: 'The menu beside the wordmark opens on any page and lists all nine. Overview returns you to the start. The eight that follow are what the others do.',
    target: '[data-tour="workflow-menu"]',
  },

  // ---------- one screen per workflow ----------
  {
    id: 'browse',
    chapter: '1. Browse & explore',
    title: 'The three libraries',
    body: 'Tools are individual methods and canvases, collections are multi-tool kits, articles are the peer-reviewed research behind them. Each library page adds filters for category, tag and keyword, and switches between grid and list.',
    target: '[data-tour="browse-links"]',
  },
  {
    id: 'find',
    chapter: '2. Find your tool',
    title: 'Answer a few questions',
    body: 'Describe your situation instead of guessing which tag your problem lives under. You are asked about your goal, your context and your stage; each answer narrows the field, and the result is a ranked shortlist rather than a filtered dump.',
    target: '[data-tour="finder-options"]',
  },
  {
    id: 'compare',
    chapter: '3. Compare tools',
    title: 'Up to three, side by side',
    body: 'Search for the candidates you are weighing up, add up to three, then press Compare. They become columns and the dimensions become rows, so objective, audience, stage and methodology line up against each other. Differences invisible when reading pages one at a time become obvious in a row.',
    target: '[data-tour="compare-table"] tr',
  },
  {
    id: 'timeline',
    chapter: '4. View by stage',
    title: 'Eight stages, with counts',
    body: 'From ideation through to maturity, with the number of tools supporting each. The markers are buttons: click one to filter the page to that stage, click it again to clear. A tool appears in every stage it genuinely supports, not only the earliest.',
    target: '[data-tour="timeline-stages"]',
  },
  {
    id: 'network',
    chapter: '5. Network graph',
    title: 'The collection as connections',
    body: 'Tools are nodes, shared tags are the edges. Search to find one and follow its links outward, or drag a node to pull its neighbors into view. Clusters are visible here in a way no index conveys: which tools sit at the center of a topic, which bridge two areas, and which stand alone.',
    target: '[data-tour="network-canvas"]',
  },
  {
    id: 'workflows',
    chapter: '6. Build workflows',
    title: 'Tools in a running order',
    body: 'One tool rarely does the whole job. Name the workflow after what it accomplishes, add tools from the panel on the right, and each becomes a numbered step you can reorder or remove. Sequence carries meaning — a mapping tool before an assessment tool gives you something to assess. Save it and it is waiting next time.',
    target: '[data-tour="wf-steps"]',
  },
  {
    id: 'compatibility',
    chapter: '7. Check compatibility',
    title: 'What fits with what you picked',
    body: 'Add the tools you are already planning to use, up to five, and the rest of the collection is ranked against them. Complementary tools come with a plain-language reason and a high, medium or low rating. Overlapping ones are the useful warning: two tools doing the same job is wasted effort.',
    target: '[data-tour="compat-results"]',
  },
  {
    id: 'visual',
    chapter: '8. Visual tool selector',
    title: 'Narrow by branches',
    body: 'The same narrowing as the questionnaire, laid out as a decision tree. Choose a goal, then a context; the matches beside it update with every branch, and backing out of one widens the list again.',
    target: '[data-tour="visual-tree"]',
  },

  // ---------- tool pages ----------
  {
    id: 'tool-tags',
    chapter: 'Tool pages',
    title: 'Tags are the index',
    body: 'Every tool carries tags, and each is a link rather than a label. Clicking one opens everything else in the collection sharing it — the fastest way to find the neighbors of a tool you already like.',
    target: '[data-tour="tag-modal"]',
  },
  {
    id: 'tool-dimensions',
    chapter: 'Tool pages',
    title: 'Twelve dimensions, every tool',
    body: 'Each tool is described along the same twelve dimensions — objective, target audience, entrepreneurship stage, methodological approach, collaboration level and more — each carrying its own tags. That consistency is what makes the stage view, comparison and compatibility possible at all.',
    target: 'h1:has-text("Dimensions")',
  },
  {
    id: 'tool-prereq',
    chapter: 'Tool pages',
    title: 'What a tool asks of you',
    body: 'Prerequisites and a difficulty level, stated before you commit. This is what decides whether a tool survives contact with a real workshop: one you can hand out cold is a different proposition from one needing three things in place first.',
    target: '[data-tour="tool-prereq"]',
  },
  {
    id: 'panels',
    chapter: 'Tool pages',
    title: 'Two pages at once',
    body: 'Related tools and the per-tool compatibility list open beside what you are reading instead of replacing it, so you can compare without losing your place. Panels stack, expand to full width, and close back to where you were.',
    target: '[data-panel-id]',
  },

  // ---------- the rest ----------
  {
    id: 'toolbar',
    chapter: 'Keeping track',
    title: 'Search, bookmarks and history',
    body: 'Search runs across titles, descriptions and tags from any page. Beside it: the pages you viewed recently, the ones you bookmarked, and the light/dark switch. The play button replays this tour whenever you want it.',
    target: '[data-tour="toolbar"]',
  },
  {
    id: 'assistant',
    chapter: 'Asking and adding',
    title: 'Describe the job, or add your own',
    body: 'The assistant reads your question against the same tags the site is organized by, narrowing with each message and showing which parts it matched. And if something is missing, Submit a tool adds it — or let Auto create draft the entry from your source material for review.',
    target: '[aria-label="Tool assistant"]',
  },
];

/** Path to a step's captured screen. */
export const tourImage = (id: string) => `/tour/${id}.jpg`;

/** Recorded position of a step's subject within its screen, if it has one. */
export const tourHotspot = (id: string): Hotspot | undefined =>
  (hotspots as Record<string, Hotspot>)[id];
