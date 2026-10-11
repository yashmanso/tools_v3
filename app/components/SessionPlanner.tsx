'use client';

import { useState, useMemo } from 'react';
import type { ResourceMetadata } from '../lib/markdown';
import { PanelLink } from './PanelLink';
import { formatCardOverview } from '../lib/markdownLinks';
import {
  buildSessionPlan,
  type Audience,
  type Experience,
  type GroupMode,
  type Aim,
} from '../lib/sessionPlan';
import { Button } from '@/components/ui/button';

interface SessionPlannerProps {
  allResources: ResourceMetadata[];
}

const AUDIENCES: { value: Audience; label: string }[] = [
  { value: 'students', label: 'Students' },
  { value: 'practitioners', label: 'Practitioners' },
  { value: 'entrepreneurs', label: 'Entrepreneurs' },
  { value: 'corporations', label: 'Corporate teams' },
  { value: 'researchers', label: 'Researchers' },
];

const EXPERIENCES: { value: Experience; label: string; hint: string }[] = [
  { value: 'new', label: 'New to this', hint: 'Entry-level tools only' },
  { value: 'some', label: 'Some background', hint: 'Opens up intermediate tools' },
];

const GROUP_MODES: { value: GroupMode; label: string; hint: string }[] = [
  { value: 'individual', label: 'On their own', hint: 'Each person works alone' },
  { value: 'small-groups', label: 'Small groups', hint: 'Tables of three to six' },
  { value: 'whole-room', label: 'Whole room', hint: 'One shared exercise' },
];

const AIMS: { value: Aim; label: string; hint: string }[] = [
  { value: 'map', label: 'Map the situation', hint: 'Lay out what is going on' },
  { value: 'assess', label: 'Assess something', hint: 'Judge it against criteria' },
  { value: 'align', label: 'Agree a direction', hint: 'Turn findings into a plan' },
];

const PHASE_NOTE: Record<string, string> = {
  Open: 'Gets the room oriented and surfaces what people already know.',
  Work: 'The main exercise. Most of the session goes here.',
  Close: 'Pulls the work together into something to act on.',
};

export function SessionPlanner({ allResources }: SessionPlannerProps) {
  const [audience, setAudience] = useState<Audience>('students');
  const [experience, setExperience] = useState<Experience>('new');
  const [groupMode, setGroupMode] = useState<GroupMode>('small-groups');
  const [aim, setAim] = useState<Aim>('assess');

  const plan = useMemo(
    () => buildSessionPlan(allResources, { audience, experience, groupMode, aim }),
    [allResources, audience, experience, groupMode, aim]
  );

  const choice = <T,>(
    active: boolean,
    onClick: () => void,
    label: string,
    hint?: string,
    key?: string
  ) => (
    <Button
      key={key ?? label}
      variant="ghost"
      onClick={onClick}
      aria-pressed={active}
      className={`h-auto flex-col items-start text-left whitespace-normal rounded-xl border px-3 py-2 transition-colors ${
        active
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/25 text-[var(--text-primary)]'
          : 'border-[var(--border)] hover:border-blue-300 text-[var(--text-secondary)]'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="text-[11px] text-[var(--text-secondary)]">{hint}</span>}
    </Button>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Plan a session</h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Describe the room and get a running order you can facilitate, with what to prepare
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* The brief */}
        <div className="lg:col-span-1">
          <div
            data-tour="session-brief"
            className="bg-[var(--bg-secondary)] rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 lg:sticky lg:top-4 space-y-5"
          >
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">
                Who is in the room
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {AUDIENCES.map(a =>
                  choice(audience === a.value, () => setAudience(a.value), a.label, undefined, a.value)
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">
                How much do they know
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {EXPERIENCES.map(e =>
                  choice(experience === e.value, () => setExperience(e.value), e.label, e.hint, e.value)
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">
                How they will work
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {GROUP_MODES.map(g =>
                  choice(groupMode === g.value, () => setGroupMode(g.value), g.label, g.hint, g.value)
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">
                What the session should achieve
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {AIMS.map(a => choice(aim === a.value, () => setAim(a.value), a.label, a.hint, a.value))}
              </div>
            </div>
          </div>
        </div>

        {/* The plan */}
        <div data-tour="session-plan" className="lg:col-span-2 space-y-4 sm:space-y-6">
          {plan.shortfall && (
            <p className="rounded-xl border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-200">
              {plan.shortfall}
            </p>
          )}

          {plan.steps.length > 0 && (
            <ol className="space-y-3 sm:space-y-4">
              {plan.steps.map((step, i) => (
                <li
                  key={step.tool.slug}
                  className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-[var(--bg-secondary)] p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                          {step.phase}
                        </span>
                        <span className="text-[11px] rounded-full bg-[var(--bg-primary)] border border-[var(--border)] px-2 py-0.5 text-[var(--text-secondary)]">
                          {step.skillLevel}
                        </span>
                      </div>

                      <PanelLink
                        href={`/${step.tool.category}/${step.tool.slug}`}
                        className="text-base font-semibold text-[var(--text-primary)] hover:text-blue-600 dark:hover:text-blue-400 hover:no-underline"
                      >
                        {step.tool.title}
                      </PanelLink>

                      <p className="mt-1 text-xs text-[var(--text-secondary)]">{PHASE_NOTE[step.phase]}</p>

                      {step.tool.overview && (
                        <p className="mt-2 text-sm text-[var(--text-secondary)] line-clamp-2">
                          {formatCardOverview(step.tool.overview)}
                        </p>
                      )}

                      <p className="mt-2 text-[11px] text-[var(--text-secondary)]">
                        Chosen because it {step.rationale}.
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}

          {/* Preparation is the part a facilitator cannot work out from the
              tool pages alone, so it is stated once for the whole session. */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-[var(--bg-secondary)] p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Before the session</h3>
            {plan.preparation.length > 0 ? (
              <ul className="space-y-1">
                {plan.preparation.map(p => (
                  <li key={p} className="text-sm text-[var(--text-secondary)] flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">
                Nothing to arrange. Every tool in this running order can be handed out cold.
              </p>
            )}
          </div>

          {plan.alternatives.length > 0 && (
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-[var(--bg-secondary)] p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Also fits this room</h3>
              <p className="text-xs text-[var(--text-secondary)] mb-3">
                Swap any of these in for a step above.
              </p>
              <div className="flex flex-wrap gap-2">
                {plan.alternatives.map(tool => (
                  <PanelLink
                    key={tool.slug}
                    href={`/${tool.category}/${tool.slug}`}
                    className="rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-1.5 text-xs text-[var(--text-primary)] hover:border-blue-400 hover:no-underline"
                  >
                    {tool.title}
                  </PanelLink>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
