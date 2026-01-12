'use client';

import { useState, useEffect } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { ChatBot } from './ChatBot';

interface ChatBotIconProps {
  allResources?: ResourceMetadata[];
}

export function ChatBotIcon({ allResources = [] }: ChatBotIconProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only render after component mounts on client to avoid hydration mismatch
  // This prevents browser extensions (like Dark Reader) from causing hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
        aria-label="Open chat"
      >
        {mounted ? (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            suppressHydrationWarning
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        ) : (
          // Placeholder during SSR to maintain layout
          <div className="w-4 h-4" />
        )}
      </button>
      {isOpen && allResources.length > 0 && (
        <ChatBot allResources={allResources} isOpen={isOpen} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
