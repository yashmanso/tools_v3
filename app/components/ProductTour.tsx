'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * First-visit guided tour.
 *
 * Runs in three chapters. The first stays on the home page; the second drives
 * the real workflow builder; the third walks a real tool page. Rather than
 * describing the interface from the outside, the tour operates it: it opens
 * the workflow builder, creates a draft workflow, and navigates to a tool so
 * every step points at the genuine thing.
 *
 * Steps whose target does not exist at the current breakpoint are dropped
 * before a chapter starts rather than skipped during it, so numbering stays
 * continuous and a step can be deliberately desktop- or mobile-only.
 *
 * Runs once per browser and waits for the welcome questions to finish.
 */

const TOUR_KEY = 'atlas-tour-completed';
const WELCOME_KEY = 'welcome-completed';

type Placement = 'center' | 'bottom' | 'top';

interface TourStep {
  chapter: string;
  title: string;
  body: string;
  /** CSS selector, or `heading:Text` to find a heading by its text. */
  target?: string;
  placement?: Placement;
  /** Click this selector when the step is entered (used to drive the UI). */
  clickFirst?: string;
  /** Go to the first tool page found on screen before showing this step. */
  gotoTool?: boolean;
  /** Switch the explore section to this mode via the workflow menu. */
  runMode?: string;
  /** Wait for this selector to exist before showing (after an action). */
  waitFor?: string;
  /**
   * Check this step's target against the live page when the tour starts, and
   * drop the step if it is absent. Only for steps whose presence depends on the
   * breakpoint (the desktop nav vs the mobile menu button). Steps in later
   * chapters must not set this: their targets do not exist yet on the home
   * page, and evaluating them early would silently delete them.
   */
  evaluateNow?: boolean;
}

const STEPS: TourStep[] = [
  // ---------- Chapter 1: getting oriented ----------
  {
    chapter: 'Welcome',
    title: 'Welcome to the Sustainability Atlas',
    body: "Tools, kits and research for sustainable innovation. This tour walks through how the collection is organised and how to work with it. It takes a couple of minutes, and you can leave at any point.",
    placement: 'center',
  },
  {
    chapter: 'Finding your way',
    target: '[data-tour="explore-hub"]',
    title: 'Nine ways to explore',
    body: 'People arrive knowing different things. Pick the route that matches what you already know: browse everything, answer a few questions, compare tools side by side, or jump straight to your stage of the innovation journey.',
    placement: 'top',
  },
  {
    chapter: 'Finding your way',
    target: '[data-tour="most-viewed"]',
    title: 'Start with what others use',
    body: 'The most viewed tools in the collection, counted from real traffic. A good first stop if you are not sure what you are looking for.',
    placement: 'top',
  },
  {
    chapter: 'Finding your way',
    target: '[data-tour="nav"]',
    evaluateNow: true,
    title: 'The library',
    body: 'Tools are individual methods and canvases. Collections are multi-tool kits. Articles are the peer-reviewed research behind them. You can also submit a tool of your own.',
    placement: 'bottom',
  },
  {
    chapter: 'Finding your way',
    target: '[aria-label="Menu"]',
    evaluateNow: true,
    title: 'The library',
    body: 'Tools, collections and articles live in here, along with the form for submitting a tool of your own.',
    placement: 'bottom',
  },
  {
    chapter: 'Finding your way',
    target: '[data-tour="toolbar"]',
    evaluateNow: true,
    title: 'Your toolbar',
    body: 'Search runs across titles, descriptions and tags from any page. Beside it: the pages you viewed recently, your bookmarks, a chat assistant for questions about the collection, and the light/dark switch.',
    placement: 'bottom',
  },

  // ---------- The workflow menu, one step per entry ----------
  {
    chapter: 'The nine workflows',
    clickFirst: '[data-tour="menu-button"]',
    waitFor: '[data-tour="workflow-menu"]',
    target: '[data-tour="workflow-menu"]',
    title: 'Every workflow lives here',
    body: 'The menu beside the wordmark opens from any page and lists all nine workflows. Each is a different way through the same collection, and Overview at the top returns you here. Here is what the other eight do.',
    placement: 'bottom',
  },
  {
    chapter: 'The nine workflows',
    runMode: 'browse',
    title: '1. Browse & explore',
    body: 'The whole collection with filters on top — category, tag and keyword. Use it when you want to see the shape of what exists before committing to anything.',
    placement: 'center',
  },
  {
    chapter: 'The nine workflows',
    runMode: 'find',
    title: '2. Find your tool',
    body: 'Answer a short sequence of questions about your situation and get a shortlist back. The fastest route when you cannot guess which tag your problem lives under.',
    placement: 'center',
  },
  {
    chapter: 'The nine workflows',
    runMode: 'compare',
    title: '3. Compare tools',
    body: 'Put up to three tools side by side across the dimensions that decide things. Differences invisible when reading pages one at a time become obvious in a row.',
    placement: 'center',
  },
  {
    chapter: 'The nine workflows',
    runMode: 'timeline',
    title: '4. View by stage',
    body: 'Eight stages from ideation to maturity. The markers are buttons: click one to filter to that stage. Tools appear in every stage they genuinely support, not just the first.',
    placement: 'center',
  },
  {
    chapter: 'The nine workflows',
    runMode: 'network',
    title: '5. Network graph',
    body: 'Tools as nodes, shared tags and themes as edges. Good for spotting clusters, and for the thing a list cannot show: which tools sit at the centre of a topic and which stand alone.',
    placement: 'center',
  },
  {
    chapter: 'The nine workflows',
    runMode: 'compatibility',
    title: '6. Check compatibility',
    body: 'Pick the tools you are considering and the Atlas sorts the rest into complementary and overlapping, each with a plain-language reason. Overlap is the useful warning: two tools doing the same job is wasted effort.',
    placement: 'center',
  },
  {
    chapter: 'The nine workflows',
    runMode: 'visual',
    title: '7. Visual tool selector',
    body: 'The same narrowing as the questionnaire, but as a decision tree — for when you would rather see the branches than answer questions.',
    placement: 'center',
  },

  // ---------- Chapter 2: workflows ----------
  {
    chapter: 'Workflows',
    runMode: 'workflows',
    waitFor: '[data-tour="wf-create"]',
    target: '[data-tour="wf-create"]',
    title: '8. Build workflows',
    body: 'One tool rarely does the whole job. A workflow is a sequence of them — map first, then assess, then align — saved so you can run it again or hand it to someone else. Let us build one.',
    placement: 'bottom',
  },
  {
    chapter: 'Workflows',
    clickFirst: '[data-tour="wf-create"]',
    waitFor: '[data-tour="wf-title"]',
    target: '[data-tour="wf-title"]',
    title: 'Name the job, not the tools',
    body: 'Give the workflow a title and a short description of what it helps accomplish — "Assess a product idea for circularity" rather than a list of tool names. That is what makes it reusable later.',
    placement: 'bottom',
  },
  {
    chapter: 'Workflows',
    target: '[data-tour="wf-add"]',
    title: 'Add tools from here',
    body: 'Search the whole collection and add tools one at a time. Each one you add becomes a numbered step in the workflow on the left.',
    placement: 'top',
  },
  {
    chapter: 'Workflows',
    target: '[data-tour="wf-steps"]',
    title: 'Order is the point',
    body: 'Steps are numbered and can be moved up or down, or removed. Sequence carries real meaning here: a mapping tool before an assessment tool gives you something to assess. Save when you are done, and the workflow is waiting next time.',
    placement: 'top',
  },

  // ---------- Chapter 3: a tool page ----------
  {
    chapter: 'Tool pages',
    gotoTool: true,
    waitFor: '[data-tour="tool-tags"]',
    target: '[data-tour="tool-tags"]',
    title: 'Tags are the index',
    body: 'Every tool carries tags, and each one is a link, not a label. Click any tag to see everything else in the collection that shares it — the fastest way to find the neighbours of a tool you already like.',
    placement: 'bottom',
  },
  {
    chapter: 'Tool pages',
    target: 'heading:Dimensions',
    title: 'Twelve dimensions, every tool',
    body: 'Each tool is described along the same twelve dimensions — objective, target audience, entrepreneurship stage, methodological approach, collaboration level and more — and each dimension carries its own tags. That consistency is what lets the Atlas compare tools at all.',
    // Above the heading, so the dimensions themselves stay readable below it.
    placement: 'top',
  },
  {
    chapter: 'Tool pages',
    target: '[data-tour="tool-prereq"]',
    title: 'What a tool asks of you',
    body: 'Prerequisites and a difficulty level, stated before you commit. This is what decides whether a tool survives contact with a real workshop: one you can hand out cold is a different proposition from one needing three things in place first.',
    placement: 'top',
  },
  {
    chapter: 'Tool pages',
    target: 'heading:Tool Compatibility',
    title: 'What works alongside it',
    body: 'Every tool page ranks the rest of the collection against it — complementary tools with a plain-language reason, and overlapping ones you probably do not need as well. Overlap is the useful warning: two tools doing the same job is wasted time.',
    placement: 'top',
  },
  {
    chapter: 'Tool pages',
    title: 'Two pages at once',
    body: 'Opening a related tool slides it in beside what you are reading instead of replacing it, so you can compare two tools without losing your place. Panels stack, expand to full width, and close back to where you were. That is the tour — have a look around.',
    placement: 'center',
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** Resolve a step target, supporting `heading:Text` as well as CSS selectors. */
function resolve(selector?: string): HTMLElement | null {
  if (!selector) return null;
  let el: HTMLElement | null = null;

  if (selector.startsWith('heading:')) {
    const wanted = selector.slice(8).trim().toLowerCase();
    const headings = Array.from(
      document.querySelectorAll<HTMLElement>('h1, h2, h3')
    );
    el = headings.find(h => (h.textContent || '').trim().toLowerCase() === wanted) || null;
  } else {
    el = document.querySelector<HTMLElement>(selector);
  }
  if (!el) return null;

  const r = el.getBoundingClientRect();
  // Zero-sized means hidden at this breakpoint. Being scrolled out of view is
  // fine - the tour scrolls to it.
  if (r.width < 4 || r.height < 4) return null;
  return el;
}

function rectOf(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

/** Wait for a selector to appear, giving up after `timeout` ms. */
function waitForSelector(selector: string, timeout = 2500): Promise<boolean> {
  return new Promise(resolve_ => {
    if (resolve(selector)) return resolve_(true);
    const started = Date.now();
    const id = window.setInterval(() => {
      if (resolve(selector)) {
        window.clearInterval(id);
        resolve_(true);
      } else if (Date.now() - started > timeout) {
        window.clearInterval(id);
        resolve_(false);
      }
    }, 100);
  });
}

export function ProductTour() {
  const [steps, setSteps] = useState<TourStep[] | null>(null);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const finish = useCallback(() => {
    setSteps(null);
    try {
      localStorage.setItem(TOUR_KEY, 'true');
    } catch {
      /* private mode - the tour simply runs again next time */
    }
  }, []);

  const start = useCallback(() => {
    // Only breakpoint-dependent steps are judged now. Everything else is kept:
    // a later chapter's target does not exist on the home page yet, and testing
    // for it here would quietly delete the deepest parts of the tour.
    const usable = STEPS.filter(s => !s.evaluateNow || resolve(s.target));
    if (usable.length < 2) return;
    setIndex(0);
    setSteps(usable);
  }, []);

  // Decide whether to run at all. Only ever begins on the home page.
  useEffect(() => {
    let done = false;
    try {
      done = localStorage.getItem(TOUR_KEY) === 'true';
    } catch {
      return; // storage blocked - do not nag on every page load
    }
    if (done || pathname !== '/') return;

    let welcomeDone = true;
    try {
      welcomeDone = localStorage.getItem(WELCOME_KEY) === 'true';
    } catch {
      welcomeDone = true;
    }

    if (welcomeDone) {
      const t = setTimeout(start, 700);
      return () => clearTimeout(t);
    }

    const onClosed = () => setTimeout(start, 400);
    window.addEventListener('welcome:closed', onClosed);
    return () => window.removeEventListener('welcome:closed', onClosed);
    // Intentionally only on mount: the tour should not restart on navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Run the current step: perform its action, wait for its target, then track it.
  useEffect(() => {
    if (!steps) return;
    const step = steps[index];
    if (!step) return;

    let cancelled = false;
    let raf = 0;
    let cleanupScroll: (() => void) | undefined;

    const run = async () => {
      setBusy(true);
      setRect(null);

      if (step.clickFirst) {
        resolve(step.clickFirst)?.click();
      }

      if (step.runMode) {
        // Drive the real menu rather than reaching into the section's state.
        if (!resolve('[data-tour="workflow-menu"]')) {
          resolve('[data-tour="menu-button"]')?.click();
          await waitForSelector('[data-tour="workflow-menu"]', 2000);
        }
        if (cancelled) return;
        resolve(`[data-tour="menu-item-${step.runMode}"]`)?.click();
        await new Promise(r => setTimeout(r, 450));
        if (cancelled) return;
      }

      if (step.gotoTool) {
        // Navigate to a real tool page. Prefer one already linked on screen so
        // the tour never depends on a hard-coded slug.
        const link = document.querySelector<HTMLAnchorElement>('a[href^="/tools/"]');
        const href = link?.getAttribute('href');
        const target = href && href !== '/tools' ? href : null;
        if (target) router.push(target);
        else {
          // Nothing to navigate to - skip the rest of this chapter.
          setBusy(false);
          finish();
          return;
        }
      }

      if (step.waitFor) {
        const appeared = await waitForSelector(step.waitFor, 4000);
        if (cancelled) return;
        if (!appeared) {
          // The UI did not reach the expected state; move on rather than stall.
          setBusy(false);
          if (index < steps.length - 1) setIndex(i => i + 1);
          else finish();
          return;
        }
      }

      if (cancelled) return;
      setBusy(false);

      const el = resolve(step.target);
      if (!el) return; // centered card

      el.scrollIntoView({ block: 'center', behavior: 'smooth' });

      const until = Date.now() + 900;
      const track = () => {
        setRect(rectOf(el));
        if (Date.now() < until) raf = requestAnimationFrame(track);
      };
      track();

      const update = () => setRect(rectOf(el));
      window.addEventListener('resize', update);
      window.addEventListener('scroll', update, true);
      cleanupScroll = () => {
        window.removeEventListener('resize', update);
        window.removeEventListener('scroll', update, true);
      };
    };

    run();
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      cleanupScroll?.();
    };
  }, [steps, index, router, finish]);

  // Keyboard: arrows to move, Escape to leave.
  useEffect(() => {
    if (!steps) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      else if (e.key === 'ArrowRight') setIndex(i => Math.min(i + 1, steps.length - 1));
      else if (e.key === 'ArrowLeft') setIndex(i => Math.max(i - 1, 0));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [steps, finish]);

  useEffect(() => {
    if (steps) cardRef.current?.focus();
  }, [steps, index]);

  if (!steps) return null;
  const step = steps[index];
  if (!step) return null;

  const isLast = index === steps.length - 1;
  const spotlit = !!rect && step.placement !== 'center';
  const pad = 8;

  // Back is offered only within a chapter: stepping backwards across a chapter
  // boundary would mean undoing an action (closing the workflow editor, leaving
  // the tool page), and a half-undone jump is worse than no Back at all.
  const canGoBack = index > 0 && steps[index - 1].chapter === step.chapter;

  // Everything here is clamped: a card that lands off-screen is unreachable,
  // so staying in bounds wins over the requested placement.
  const CARD_H = 260;
  let cardStyle: React.CSSProperties;

  if (spotlit && rect) {
    const maxW = 380;
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
    const left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - maxW / 2),
      Math.max(12, vw - maxW - 12)
    );
    const width = `min(${maxW}px, calc(100vw - 24px))`;

    if (rect.height > vh * 0.5) {
      // A section taller than half the screen has no "beside" to sit in, so
      // pin the card to the bottom and let the ring mark the section.
      cardStyle = { bottom: 24, left, width };
    } else {
      const roomAbove = rect.top;
      const roomBelow = vh - (rect.top + rect.height);
      const wantAbove = step.placement === 'top';
      const putAbove = wantAbove ? roomAbove > CARD_H : roomBelow < CARD_H && roomAbove > roomBelow;
      const rawTop = putAbove ? rect.top - pad - 10 - CARD_H : rect.top + rect.height + pad + 10;
      const top = Math.min(Math.max(12, rawTop), Math.max(12, vh - CARD_H - 12));
      cardStyle = { top, left, width };
    }
  } else {
    cardStyle = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 'min(440px, calc(100vw - 32px))',
    };
  }

  const progress = ((index + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-[300]" role="dialog" aria-modal="true" aria-label="Platform tour">
      {spotlit ? (
        <div className="absolute inset-0" onClick={finish} />
      ) : (
        <div className="absolute inset-0 bg-black/60" onClick={finish} />
      )}

      {spotlit && rect && (
        <div
          className="absolute rounded-xl ring-4 ring-blue-500 pointer-events-none transition-all duration-200"
          style={{
            top: rect.top - pad,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
          }}
        />
      )}

      <div
        ref={cardRef}
        tabIndex={-1}
        className="absolute rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl overflow-hidden focus:outline-none"
        style={cardStyle}
      >
        {/* Chapter progress */}
        <div className="h-0.5 w-full bg-[var(--border-subtle)]">
          <div
            className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {step.chapter}
            </p>
            <button
              type="button"
              onClick={finish}
              aria-label="Close tour"
              className="shrink-0 -mt-1 p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)] mb-2">
            {step.title}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.body}</p>

          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="text-[11px] text-[var(--text-secondary)] tabular-nums">
              {index + 1} / {steps.length}
            </span>

            <div className="flex items-center gap-2">
              {canGoBack && (
                <button
                  type="button"
                  onClick={() => setIndex(i => Math.max(i - 1, 0))}
                  className="px-3 py-1.5 text-xs font-medium rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
                >
                  Back
                </button>
              )}
              {!isLast && (
                <button
                  type="button"
                  onClick={finish}
                  className="px-3 py-1.5 text-xs font-medium rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => (isLast ? finish() : setIndex(i => i + 1))}
                className="px-4 py-1.5 text-xs font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {isLast ? 'Start exploring' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
