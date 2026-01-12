'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { usePathname } from 'next/navigation';
import { usePanels } from './PanelContext';
import { ChatBotIcon } from './ChatBotIcon';
import { FavoritesIcon } from './FavoritesIcon';
import { RecentViewsSidebar } from './RecentViewsSidebar';
import { ResourceMetadata } from '../lib/markdown';

interface HeaderProps {
  allResources: ResourceMetadata[];
}

export function Header({ allResources }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [recentViewsOpen, setRecentViewsOpen] = useState(false);
  const pathname = usePathname();
  const { clearPanels } = usePanels();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm bg-[var(--bg-primary)]/80 border-b border-[var(--border)]">
      <div className="container mx-auto px-6 py-5 flex items-center justify-between max-w-5xl">
        <Link
          href="/"
          onClick={clearPanels}
          className="text-base font-semibold tracking-tight hover:text-[var(--text-secondary)] transition-colors"
        >
          Sustainability Atlas
        </Link>

        <nav className="flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)]">
          <Link
            href="/"
            onClick={clearPanels}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              isActive('/') && pathname === '/'
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
            }`}
          >
            Home
          </Link>
          <Link
            href="/tools"
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              isActive('/tools')
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
            }`}
          >
            Tools
          </Link>
          <Link
            href="/collections"
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              isActive('/collections')
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
            }`}
          >
            Collections
          </Link>
          <Link
            href="/articles"
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              isActive('/articles')
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
            }`}
          >
            Articles
          </Link>

          <div className="ml-2 pl-2 border-l border-[var(--border)] flex items-center gap-2">
            <button
              onClick={() => setRecentViewsOpen(!recentViewsOpen)}
              className="p-1.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors relative"
              aria-label="Recent views"
              title="Recent views"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <FavoritesIcon allResources={allResources} />
            <ChatBotIcon allResources={allResources} />
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </nav>
      </div>
      <RecentViewsSidebar 
        allResources={allResources} 
        isOpen={recentViewsOpen} 
        onClose={() => setRecentViewsOpen(false)} 
      />
    </header>
  );
}
