'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { ResourceMetadata } from '../lib/markdown';
import { PanelLink } from './PanelLink';
import { formatCardOverview } from '../lib/markdownLinks';
import { DIMENSION_LABELS, detectFacets, freeTokens, type Facet } from '../lib/chatFacets';
import { rank, type Match } from '../lib/chatSearch';
import { Button } from '@/components/ui/button';

interface ChatBotProps {
  allResources: ResourceMetadata[];
  isOpen?: boolean;
  onClose?: () => void;
}

interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
  matches?: Match[];
  /** A pointer to one of the site's workflows, when that answers it better. */
  route?: { href: string; label: string };
}

/** Questions about the site itself, answered with the workflow that does the job. */
const HOW_TO: { test: RegExp; answer: string; route?: { href: string; label: string } }[] = [
  {
    test: /\b(compare|side by side|difference between|versus|vs)\b/,
    answer: 'Compare tools puts up to three side by side, with the dimensions as rows so differences line up.',
    route: { href: '/', label: 'Open Compare tools' },
  },
  {
    test: /\b(work together|combine|sequence|order|alongside|compatib)\b/,
    answer: 'Check compatibility ranks the collection against the tools you have already picked, and warns you when two of them overlap.',
    route: { href: '/', label: 'Open Check compatibility' },
  },
  {
    test: /\b(workflow|step by step|process to follow)\b/,
    answer: 'Build workflows chains tools into a numbered sequence you can save and reuse.',
    route: { href: '/', label: 'Open Build workflows' },
  },
  {
    test: /\b(stage|journey|phase)\b/,
    answer: 'View by stage lays the collection across the eight stages from ideation to maturity, and each tool appears in every stage it supports.',
    route: { href: '/', label: 'Open View by stage' },
  },
  {
    test: /\b(submit|add a tool|contribute)\b/,
    answer: 'You can submit a tool from the Submit a tool page, or let the assisted route draft the entry from your source material for review.',
    route: { href: '/submit-tool', label: 'Submit a tool' },
  },
];

const STARTERS = [
  'Assess my startup for sustainability',
  'Map a circular business model',
  'Tools I can run in a workshop',
  'Measure environmental impact',
];

export function ChatBot({ allResources, isOpen: externalIsOpen, onClose }: ChatBotProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  /** Facets carried between turns, so each message narrows the previous answer. */
  const [facets, setFacets] = useState<Facet[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      type: 'bot',
      content:
        'Tell me what you are trying to do and I will find tools for it. I read your question against the same tags the rest of the site uses, so you can keep adding detail to narrow things down.',
    },
  ]);

  const nextId = useRef(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const handleClose = useCallback(
    () => (onClose ? onClose() : setInternalIsOpen(false)),
    [onClose]
  );

  const tools = useMemo(
    () => allResources.filter(r => r.category === 'tools'),
    [allResources]
  );

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, thinking]);

  // Escape closes; a click outside the panel closes.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    const onDown = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) handleClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [isOpen, handleClose]);

  const respond = useCallback(
    (text: string, carried: Facet[]) => {
      const found = detectFacets(text);
      // Later turns add to earlier ones rather than replacing them.
      const merged = [...carried];
      for (const f of found) if (!merged.some(m => m.tag === f.tag)) merged.push(f);

      const words = freeTokens(text).filter(
        w => !merged.some(f => f.tag.toLowerCase().includes(w) || f.synonyms.includes(w))
      );

      const howTo = HOW_TO.find(h => h.test.test(text.toLowerCase()));
      const matches = rank(tools, merged, words);

      let content: string;
      if (merged.length === 0 && words.length === 0) {
        content = 'Tell me a bit more — what are you trying to do, who is it for, or what stage are you at?';
      } else if (matches.length === 0) {
        content = `Nothing matched that. Try removing a filter above, or describe it differently — the collection has ${tools.length} tools covering goals like mapping, assessment and reporting.`;
      } else {
        const reading = merged.length
          ? merged.map(f => f.label).join(', ')
          : words.join(', ');
        content = `Reading that as: ${reading}. Here is what fits best:`;
      }

      return { facets: merged, message: { content, matches: matches.length ? matches : undefined, route: howTo?.route }, howTo };
    },
    [tools]
  );

  const send = useCallback(
    (raw: string) => {
      const text = raw.trim();
      if (!text) return;

      setMessages(prev => [...prev, { id: nextId.current++, type: 'user', content: text }]);
      setInput('');
      setThinking(true);

      window.setTimeout(() => {
        const { facets: merged, message, howTo } = respond(text, facets);
        setFacets(merged);
        setThinking(false);
        setMessages(prev => [
          ...prev,
          ...(howTo
            ? [{ id: nextId.current++, type: 'bot' as const, content: howTo.answer, route: howTo.route }]
            : []),
          { id: nextId.current++, type: 'bot' as const, ...message },
        ]);
      }, 350);
    },
    [facets, respond]
  );

  const removeFacet = (tag: string) => {
    const next = facets.filter(f => f.tag !== tag);
    setFacets(next);
    const matches = rank(tools, next, []);
    setMessages(prev => [
      ...prev,
      {
        id: nextId.current++,
        type: 'bot',
        content: next.length
          ? `Dropped that. Now showing: ${next.map(f => f.label).join(', ')}.`
          : 'Filters cleared. What are you looking for?',
        matches: next.length && matches.length ? matches : undefined,
      },
    ]);
  };

  const reset = () => {
    setFacets([]);
    nextId.current = 1;
    setMessages([
      {
        id: 0,
        type: 'bot',
        content: 'Starting over. What are you trying to do?',
      },
    ]);
    inputRef.current?.focus();
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/50 z-[150]" aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Tool assistant"
        className="fixed z-[200] bg-[var(--bg-secondary)] shadow-2xl flex flex-col
                   inset-x-0 bottom-0 h-[85vh] rounded-t-2xl border-t border-[var(--border)]
                   sm:inset-y-0 sm:right-0 sm:left-auto sm:h-auto sm:w-[26rem]
                   sm:rounded-none sm:border-t-0 sm:border-l"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-4 border-b border-[var(--border)]">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Find a tool</h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Describe the job, not the tool name
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {(facets.length > 0 || messages.length > 1) && (
              <Button
                variant="ghost"
                onClick={reset}
                className="px-2 py-1 text-xs rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
              >
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={handleClose}
              aria-label="Close assistant"
              className="p-1.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </Button>
          </div>
        </div>

        {/* Active filters - what the assistant is currently narrowing on */}
        {facets.length > 0 && (
          <div className="px-4 py-2.5 border-b border-[var(--border)] flex flex-wrap gap-1.5">
            {facets.map(f => (
              <button
                key={f.tag}
                type="button"
                onClick={() => removeFacet(f.tag)}
                title={`Remove ${f.label}`}
                className="group inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--bg-primary)] pl-2 pr-1.5 py-0.5 text-[11px] text-[var(--text-primary)] hover:border-red-400"
              >
                <span className="text-[var(--text-secondary)]">{DIMENSION_LABELS[f.dimension]}:</span>
                {f.label}
                <svg className="w-3 h-3 text-[var(--text-secondary)] group-hover:text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            ))}
          </div>
        )}

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map(msg => (
            <div key={msg.id}>
              <div className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)]'
                  }`}
                >
                  {msg.content}
                </div>
              </div>

              {msg.route && (
                <PanelLink
                  href={msg.route.href}
                  className="mt-2 inline-block text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {msg.route.label} →
                </PanelLink>
              )}

              {msg.matches && (
                <ul className="mt-2 space-y-2">
                  {msg.matches.map(m => (
                    <li key={m.resource.slug}>
                      <PanelLink
                        href={`/${m.resource.category}/${m.resource.slug}`}
                        className="block rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-3 hover:border-blue-400 transition-colors hover:no-underline"
                      >
                        <span className="block text-sm font-semibold text-[var(--text-primary)]">
                          {m.resource.title}
                        </span>
                        {m.resource.overview && (
                          <span className="mt-1 text-xs text-[var(--text-secondary)] line-clamp-2">
                            {formatCardOverview(m.resource.overview)}
                          </span>
                        )}
                        {m.hits.length > 0 && (
                          <span className="mt-1.5 flex flex-wrap gap-1">
                            {m.hits.map(h => (
                              <span
                                key={h}
                                className="rounded-full bg-green-50 dark:bg-green-900/25 px-1.5 py-0.5 text-[10px] text-green-700 dark:text-green-300"
                              >
                                {h}
                              </span>
                            ))}
                          </span>
                        )}
                      </PanelLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {thinking && (
            <div className="flex justify-start" aria-live="polite">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2.5">
                <span className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] animate-bounce"
                      style={{ animationDelay: `${i * 120}ms` }}
                    />
                  ))}
                </span>
              </div>
            </div>
          )}

          {/* Starter prompts, while the conversation is still empty */}
          {messages.length === 1 && !thinking && (
            <div className="pt-1 space-y-1.5">
              <p className="text-[11px] uppercase tracking-wide text-[var(--text-secondary)]">
                Try one of these
              </p>
              {STARTERS.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="block w-full text-left rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-3 py-2 text-xs text-[var(--text-primary)] hover:border-blue-400 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Composer */}
        <div className="p-3 border-t border-[var(--border)]">
          <form
            onSubmit={e => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="e.g. assess a circular product idea"
              aria-label="Describe what you need"
              className="flex-1 min-w-0 rounded-full border border-[var(--border)] bg-[var(--bg-primary)] px-3.5 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Send"
              className="shrink-0 rounded-full bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="13 6 19 12 13 18" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>,
    document.body
  );
}
