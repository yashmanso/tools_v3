/**
 * The guided tour, as a sequence of captured screens.
 *
 * Each step names an image in /public/tour. The screens are captured by
 * `npm run tour:shots`, which drives a real browser over the built site using
 * the recipes in scripts/capture-tour.mjs — the ids below are the contract
 * between the two, and the script fails if either side gains a step the other
 * does not have.
 *
 * Showing captures rather than driving the live site means the tour has no side
 * effects (it used to leave a draft workflow behind and navigate the reader
 * away), every step appears instantly, and it can show populated screens — a
 * filled comparison table, real compatibility results — where driving the live
 * UI could only honestly show an empty one.
 *
 * The cost is that captures do not update themselves: re-run the script after
 * changing any screen it shows.
 */

export interface TourStep {
  /** Matches the capture recipe and the image filename. */
  id: string;
  chapter: string;
  title: string;
  body: string;
}

export const TOUR_STEPS: TourStep[] = [
  // ---------- Getting oriented ----------
  {
    id: 'welcome',
    chapter: 'Welcome',
    title: 'Welcome to the Sustainability Atlas',
    body: 'Tools, kits and research for sustainable innovation. This tour walks through how the collection is organised and how to work with it. Use the arrow keys or space to move, and leave whenever you like.',
  },
  {
    id: 'hub',
    chapter: 'Finding your way',
    title: 'Nine ways to explore',
    body: 'People arrive knowing different things. Pick the route that matches what you already know: browse everything, answer a few questions, compare tools side by side, or jump straight to your stage of the innovation journey.',
  },
  {
    id: 'most-viewed',
    chapter: 'Finding your way',
    title: 'Start with what others use',
    body: 'The most viewed tools in the collection, counted from real traffic rather than hand-picked. A good first stop if you are not sure what you are looking for.',
  },
  {
    id: 'toolbar',
    chapter: 'Finding your way',
    title: 'The library and your toolbar',
    body: 'Tools are individual methods and canvases, collections are multi-tool kits, articles are the research behind them. The icons hold search, the pages you viewed recently, your bookmarks, the assistant and the light/dark switch.',
  },
  {
    id: 'menu',
    chapter: 'Finding your way',
    title: 'Every workflow lives here',
    body: 'The menu beside the wordmark opens from any page and lists all nine workflows. Each is a different way through the same collection, and Overview returns you to the start. Here is what the other eight do.',
  },

  // ---------- 1. Browse ----------
  {
    id: 'browse',
    chapter: '1. Browse & explore',
    title: 'Browse the whole collection',
    body: 'Three libraries, each with filters for category, tag and keyword on top. Use this when you want the shape of what exists before committing to anything.',
  },

  // ---------- 2. Find your tool ----------
  {
    id: 'find-question',
    chapter: '2. Find your tool',
    title: 'Answer a few questions',
    body: 'Rather than guessing which tag your problem lives under, describe your situation. The questionnaire asks about your goal, your context and your stage.',
  },
  {
    id: 'find-results',
    chapter: '2. Find your tool',
    title: 'A shortlist, not a filtered dump',
    body: 'Each answer narrows the field, and the result is a ranked shortlist matched to what you said — with the reasoning visible so you can tell whether it understood you.',
  },

  // ---------- 3. Compare ----------
  {
    id: 'compare-pick',
    chapter: '3. Compare tools',
    title: 'Pick up to three tools',
    body: 'Search for the candidates you are weighing up and add them. Three is the limit, which is about as many as a table stays readable with.',
  },
  {
    id: 'compare-table',
    chapter: '3. Compare tools',
    title: 'Read them across, not down',
    body: 'The chosen tools become columns and the dimensions become rows, so objective, audience, stage and methodology line up against each other. Differences invisible when reading pages one at a time become obvious in a row.',
  },

  // ---------- 4. Stage ----------
  {
    id: 'timeline-stages',
    chapter: '4. View by stage',
    title: 'Eight stages, with counts',
    body: 'From ideation through to maturity. The number under each stage is how many tools support it. The markers are buttons, not decoration: click one to filter the page to that stage.',
  },
  {
    id: 'timeline-filtered',
    chapter: '4. View by stage',
    title: 'Tools in every stage they fit',
    body: 'Selecting a stage filters the page to it. A tool appears in every stage it genuinely supports rather than only the earliest one, so a tool useful from startup through maturity shows up in all four.',
  },

  // ---------- 5. Network ----------
  {
    id: 'network',
    chapter: '5. Network graph',
    title: 'The collection as connections',
    body: 'Tools are nodes and shared tags are the edges between them. Clusters are visible here in a way no index conveys: which tools sit at the centre of a topic, which bridge two areas, and which stand on their own.',
  },

  // ---------- 6. Workflows ----------
  {
    id: 'wf-start',
    chapter: '6. Build workflows',
    title: 'Workflows put tools in order',
    body: 'One tool rarely does the whole job. A workflow is a sequence of them — map first, then assess, then align — saved so you can run it again or hand it to someone else.',
  },
  {
    id: 'wf-add',
    chapter: '6. Build workflows',
    title: 'Name the job, then add tools',
    body: 'Title it after what it accomplishes rather than the tools it contains — "Assess a product idea for circularity" — then search the collection and add tools from the panel on the right.',
  },
  {
    id: 'wf-steps',
    chapter: '6. Build workflows',
    title: 'Order is the point',
    body: 'Each tool becomes a numbered step that can be moved or removed. Sequence carries real meaning: a mapping tool before an assessment tool gives you something to assess. Save, and it is waiting next time.',
  },

  // ---------- 7. Compatibility ----------
  {
    id: 'compat-select',
    chapter: '7. Check compatibility',
    title: 'Start from what you have chosen',
    body: 'Add the tools you are already planning to use — up to five. Everything else in the collection is then ranked against that selection.',
  },
  {
    id: 'compat-results',
    chapter: '7. Check compatibility',
    title: 'Complementary, and overlapping',
    body: 'Complementary tools come with a plain-language reason and a high, medium or low rating. Overlapping ones are the useful warning: two tools doing the same job is wasted effort, so it tells you when you only need one.',
  },

  // ---------- 8. Visual selector ----------
  {
    id: 'visual',
    chapter: '8. Visual tool selector',
    title: 'Narrow by branches',
    body: 'The same narrowing as the questionnaire, laid out as a decision tree. Choose a goal, then a context, and the matches beside it update with every branch you take.',
  },

  // ---------- Tool pages ----------
  {
    id: 'tool-tags',
    chapter: 'Tool pages',
    title: 'Tags are the index',
    body: 'Every tool carries tags, and each is a link rather than a label. Click one to see everything else sharing it — the fastest way to find the neighbours of a tool you already like.',
  },
  {
    id: 'tool-dimensions',
    chapter: 'Tool pages',
    title: 'Twelve dimensions, every tool',
    body: 'Each tool is described along the same twelve dimensions — objective, target audience, entrepreneurship stage, methodological approach, collaboration level and more — each carrying its own tags. That consistency is what lets the Atlas compare tools at all.',
  },
  {
    id: 'tool-prereq',
    chapter: 'Tool pages',
    title: 'What a tool asks of you',
    body: 'Prerequisites and a difficulty level, stated before you commit. This is what decides whether a tool survives contact with a real workshop: one you can hand out cold is a different proposition from one needing three things in place first.',
  },
  {
    id: 'tool-compat',
    chapter: 'Tool pages',
    title: 'What works alongside it',
    body: 'Every tool page ranks the rest of the collection against it, so you can keep moving outward from whatever you are reading without going back to a menu.',
  },
  {
    id: 'panels',
    chapter: 'Tool pages',
    title: 'Two pages at once',
    body: 'Opening a related tool slides it in beside what you are reading instead of replacing it, so you can compare two tools without losing your place. Panels stack, expand to full width, and close back to where you were.',
  },

  // ---------- Assistant ----------
  {
    id: 'assistant',
    chapter: 'The assistant',
    title: 'Describe the job, not the tool',
    body: 'Tell the assistant what you are trying to do and it reads your question against the same tags the site is organised by. Each message narrows the last, the filters it applied show as chips you can remove, and every suggestion says which parts of your question it matched.',
  },
];

/** Path to a step's captured screen. */
export const tourImage = (id: string) => `/tour/${id}.jpg`;
