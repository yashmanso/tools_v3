'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TOUR_STEPS, tourImage } from '../lib/tourSteps';

/**
 * The guided tour.
 *
 * A slideshow of captured screens rather than a trip through the live site.
 * Driving the real interface left a draft workflow behind, navigated the reader
 * away from wherever they were, and made every step wait on the UI reaching an
 * expected state. Captures have none of that, appear instantly, and can show
 * populated screens — a filled comparison table, real compatibility results —
 * which the live version could only honestly show empty.
 *
 * Screens are captured by `npm run tour:shots`; they do not update themselves.
 *
 * Runs once per browser, waits for the welcome questions to finish, and can be
 * replayed from the toolbar.
 */

const TOUR_KEY = 'atlas-tour-completed';
const WELCOME_KEY = 'welcome-completed';

export function ProductTour() {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [restartWanted, setRestartWanted] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const finish = useCallback(() => {
    setActive(false);
    try {
      localStorage.setItem(TOUR_KEY, 'true');
    } catch {
      /* private mode - the tour simply runs again next time */
    }
  }, []);

  const start = useCallback(() => {
    setIndex(0);
    setActive(true);
  }, []);

  // Decide whether to run at all. Only ever begins on the home page.
  useEffect(() => {
    let done = false;
    try {
      done = localStorage.getItem(TOUR_KEY) === 'true';
    } catch {
      return; // storage blocked - do not nag on every page load
    }
    if (done || window.location.pathname !== '/') return;

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

  // Replayed from the toolbar. The header sends us home first when needed.
  useEffect(() => {
    const onRestart = () => setRestartWanted(true);
    window.addEventListener('tour:restart', onRestart);
    return () => window.removeEventListener('tour:restart', onRestart);
  }, []);

  useEffect(() => {
    if (!restartWanted || pathname !== '/') return;
    const t = setTimeout(() => {
      setRestartWanted(false);
      start();
    }, 400);
    return () => clearTimeout(t);
  }, [restartWanted, pathname, start]);

  // Pull every screen in up front, so stepping never waits on a download.
  useEffect(() => {
    if (!active || loaded) return;
    let cancelled = false;
    Promise.all(
      TOUR_STEPS.map(
        step =>
          new Promise<void>(resolve => {
            const img = new Image();
            img.onload = img.onerror = () => resolve();
            img.src = tourImage(step.id);
          })
      )
    ).then(() => {
      if (!cancelled) setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [active, loaded]);

  const next = useCallback(() => {
    setIndex(i => {
      if (i >= TOUR_STEPS.length - 1) {
        finish();
        return i;
      }
      return i + 1;
    });
  }, [finish]);

  const prev = useCallback(() => setIndex(i => Math.max(i - 1, 0)), []);

  // Space and the arrow keys page through; Escape leaves.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      const typing =
        !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);

      if (e.key === 'Escape') {
        finish();
      } else if (e.key === 'ArrowRight' || (!typing && (e.key === ' ' || e.code === 'Space'))) {
        e.preventDefault(); // space would otherwise scroll the page behind
        next();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prev();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active, next, prev, finish]);

  useEffect(() => {
    if (active) cardRef.current?.focus();
  }, [active, index]);

  if (!active) return null;

  const step = TOUR_STEPS[index];
  if (!step) return null;

  const isLast = index === TOUR_STEPS.length - 1;
  const canGoBack = index > 0;
  const progress = ((index + 1) / TOUR_STEPS.length) * 100;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Platform tour"
    >
      <div className="absolute inset-0 bg-black/70" onClick={finish} />

      <div
        ref={cardRef}
        tabIndex={-1}
        className="relative w-full max-w-3xl max-h-full overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl focus:outline-none"
      >
        {/* Progress */}
        <div className="h-0.5 w-full bg-[var(--border-subtle)]">
          <div
            className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* The captured screen */}
        <div className="relative bg-[var(--bg-primary)] border-b border-[var(--border)]">
          <div className="aspect-[16/10] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={step.id}
              src={tourImage(step.id)}
              alt={step.title}
              width={1280}
              height={800}
              className="w-full h-full object-cover object-top"
              draggable={false}
            />
          </div>
          <button
            type="button"
            onClick={finish}
            aria-label="Close tour"
            className="absolute top-2 right-2 rounded-full bg-black/55 p-1.5 text-white hover:bg-black/75 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        {/* Caption */}
        <div className="p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            {step.chapter}
          </p>
          <h2 className="mt-1 text-base sm:text-lg font-semibold text-[var(--text-primary)]">
            {step.title}
          </h2>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)] leading-relaxed">{step.body}</p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="text-[11px] text-[var(--text-secondary)] tabular-nums">
              {index + 1} / {TOUR_STEPS.length}
            </span>

            <div className="flex items-center gap-2">
              {canGoBack && (
                <button
                  type="button"
                  onClick={prev}
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
                onClick={isLast ? finish : next}
                className="px-4 py-1.5 text-xs font-semibold rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {isLast ? 'Start exploring' : 'Next'}
              </button>
            </div>
          </div>

          <p className="mt-2 text-[10px] text-[var(--text-secondary)] text-center">
            Space or → to continue, ← to go back, Esc to close
          </p>
        </div>
      </div>
    </div>
  );
}
