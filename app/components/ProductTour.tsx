'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * First-visit guided tour.
 *
 * Walks a new visitor through the sections of the platform with a spotlight on
 * the real element being described, scrolling each one into view as it goes.
 *
 * Steps whose target does not exist at the current breakpoint are dropped
 * before the tour starts rather than skipped during it, so the step numbering
 * stays continuous instead of jumping. That also lets a step be deliberately
 * mobile-only or desktop-only: it simply appears where its target does.
 *
 * Runs once per browser, and waits for the welcome questions to finish so the
 * two never overlap.
 */

const TOUR_KEY = 'atlas-tour-completed';
const WELCOME_KEY = 'welcome-completed';

type Placement = 'center' | 'bottom' | 'top';

interface TourStep {
  /** CSS selector for the element to spotlight. Omit for a centered card. */
  target?: string;
  title: string;
  body: string;
  placement?: Placement;
}

const STEPS: TourStep[] = [
  {
    title: 'Welcome to the Sustainability Atlas',
    body: "A collection of tools, kits and research for sustainable innovation. Here's a quick tour of how to find your way around — it takes about a minute.",
    placement: 'center',
  },
  {
    target: '[data-tour="explore-hub"]',
    title: 'Nine ways to explore',
    body: 'People arrive knowing different things. Pick the route that matches what you already know: browse everything, answer a few questions, compare tools side by side, or jump straight to your stage of the innovation journey.',
    placement: 'top',
  },
  {
    target: '[data-tour="most-viewed"]',
    title: 'Start with what others use',
    body: 'The most viewed tools in the collection, counted from real traffic. A good first stop if you are not sure what you are looking for.',
    placement: 'top',
  },
  {
    // Desktop only - the nav collapses into the menu button below md.
    target: '[data-tour="nav"]',
    title: 'The library',
    body: 'Tools are individual methods and canvases. Collections are multi-tool kits. Articles are the peer-reviewed research behind them. You can also submit a tool of your own.',
    placement: 'bottom',
  },
  {
    // Mobile only - this button is hidden from md upwards.
    target: '[aria-label="Menu"]',
    title: 'The library',
    body: 'Tools, collections and articles live in here, along with the form for submitting a tool of your own.',
    placement: 'bottom',
  },
  {
    target: '[aria-label="Search tools"]',
    title: 'Search',
    body: 'Already know the name? Search runs across titles, descriptions and tags from any page on the site.',
    placement: 'bottom',
  },
  {
    target: '[aria-label="Recent views"]',
    title: 'Pick up where you left off',
    body: 'Pages you have opened recently stay one click away, so you can return to a tool without searching for it again.',
    placement: 'bottom',
  },
  {
    target: '[aria-label="Toggle theme"]',
    title: 'Light and dark',
    body: 'Switch themes whenever you like. Your choice is remembered on this device.',
    placement: 'bottom',
  },
  {
    title: 'One last thing',
    body: 'Opening a related tool slides it in beside what you are reading instead of replacing it, so you can compare two tools side by side. Tags are clickable too — they show everything else sharing them.',
    placement: 'center',
  },
];

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** The element, if it is actually rendered at this breakpoint. */
function renderedTarget(selector?: string): HTMLElement | null {
  if (!selector) return null;
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  // Zero-sized means hidden (display:none, or a collapsed responsive branch).
  // Being scrolled out of view is fine - the tour scrolls to it.
  if (r.width < 4 || r.height < 4) return null;
  return el;
}

function rectOf(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function ProductTour() {
  const [steps, setSteps] = useState<TourStep[] | null>(null);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const finish = useCallback(() => {
    setSteps(null);
    try {
      localStorage.setItem(TOUR_KEY, 'true');
    } catch {
      /* private mode - the tour simply runs again next time */
    }
  }, []);

  const start = useCallback(() => {
    // Keep only steps that have something to point at here.
    const usable = STEPS.filter(s => !s.target || renderedTarget(s.target));
    if (usable.length < 2) return; // nothing worth showing
    setIndex(0);
    setSteps(usable);
  }, []);

  // Decide whether to run at all. Waits for the welcome questions to be done.
  useEffect(() => {
    let done = false;
    try {
      done = localStorage.getItem(TOUR_KEY) === 'true';
    } catch {
      return; // storage blocked - do not nag on every page load
    }
    if (done) return;

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

    // Welcome is still open - start once it closes.
    const onClosed = () => setTimeout(start, 400);
    window.addEventListener('welcome:closed', onClosed);
    return () => window.removeEventListener('welcome:closed', onClosed);
  }, [start]);

  // Scroll the current target into view and keep the spotlight on it.
  useEffect(() => {
    if (!steps) return;
    const step = steps[index];
    if (!step) return;

    const el = renderedTarget(step.target);
    if (!el) {
      setRect(null);
      return;
    }

    el.scrollIntoView({ block: 'center', behavior: 'smooth' });

    // Follow the element while the smooth scroll settles.
    let raf = 0;
    const until = Date.now() + 900;
    const track = () => {
      setRect(rectOf(el));
      if (Date.now() < until) raf = requestAnimationFrame(track);
    };
    track();

    const update = () => setRect(rectOf(el));
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [steps, index]);

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
  const spotlit = rect && step.placement !== 'center';
  const pad = 8;

  // Place the card near the highlighted element. Everything here is clamped:
  // a card that lands off-screen is unreachable, so bounds win over placement.
  const CARD_H = 250; // generous estimate, used only for clamping
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

  return (
    <div className="fixed inset-0 z-[300]" role="dialog" aria-modal="true" aria-label="Platform tour">
      {/* When a target is spotlit, the ring's huge outer shadow is the dimmer,
          so the element itself stays fully legible. Otherwise dim everything. */}
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
        className="absolute rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl p-5 focus:outline-none"
        style={cardStyle}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
            {step.title}
          </h2>
          <button
            type="button"
            onClick={finish}
            aria-label="Close tour"
            className="shrink-0 p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.body}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`rounded-full transition-all ${
                  i === index
                    ? 'w-5 h-1.5 bg-blue-600 dark:bg-blue-400'
                    : 'w-1.5 h-1.5 bg-[var(--border)]'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {index > 0 && (
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
              onClick={() => (isLast ? finish() : setIndex(i => i + 1))}
              className="px-4 py-1.5 text-xs font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {isLast ? 'Start exploring' : 'Next'}
            </button>
          </div>
        </div>

        <p className="mt-3 text-[10px] text-[var(--text-secondary)] text-center">
          Step {index + 1} of {steps.length}
        </p>
      </div>
    </div>
  );
}
