'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { usePathname } from 'next/navigation';
import { usePanels } from './PanelContext';
import { useSidebar } from './SidebarContext';
import { ChatBotIcon } from './ChatBotIcon';
import { FavoritesIcon } from './FavoritesIcon';
import { RecentViewsSidebar } from './RecentViewsSidebar';
import type { ResourceMetadata } from '../lib/markdown';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  allResources: ResourceMetadata[];
}

export function Header({ allResources }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [recentViewsOpen, setRecentViewsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { clearPanels } = usePanels();
  const { sidebarVisible, sidebarMounted, toggleSidebar } = useSidebar();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[var(--bg-primary)]/90 border-b border-[var(--border)]">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-5 flex items-center justify-between max-w-5xl">
        <div className="flex items-center gap-2">
          {/* Apple-Mail-style sidebar toggle — only visible on lg when ExploreSection is mounted */}
          {sidebarMounted && (
            <Button
              variant="ghost"
              onClick={toggleSidebar}
              className="hidden lg:inline-flex p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
              aria-label={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
              title={sidebarVisible ? 'Hide sidebar' : 'Show sidebar'}
            >
              {sidebarVisible ? (
                /* Sidebar-open icon: panel highlighted on left */
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                  <line x1="5" y1="8" x2="7.5" y2="8" strokeLinecap="round" />
                  <line x1="5" y1="11" x2="7.5" y2="11" strokeLinecap="round" />
                  <line x1="5" y1="14" x2="7.5" y2="14" strokeLinecap="round" />
                </svg>
              ) : (
                /* Sidebar-closed icon: plain panel outline */
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              )}
            </Button>
          )}
          <Link
            href="/"
            onClick={clearPanels}
            className="text-sm sm:text-base font-semibold tracking-tight hover:text-[var(--text-secondary)] transition-colors"
          >
            Sustainability Atlas
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)]">
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
          <Link
            href="/submit-tool"
            onClick={clearPanels}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              isActive('/submit-tool')
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
            }`}
          >
            Submit a tool
          </Link>
          <Link
            href="/auto-create-tool"
            onClick={clearPanels}
            className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              isActive('/auto-create-tool')
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)]'
            }`}
          >
            Auto create tool
          </Link>

          <div className="ml-2 pl-2 border-l border-[var(--border)] flex items-center gap-2">
            <Button variant="ghost"
              onClick={() => setRecentViewsOpen(!recentViewsOpen)}
              className="p-1.5 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors relative"
              aria-label="Recent views"
              title="Recent views"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Button>
            <FavoritesIcon allResources={allResources} />
            <ChatBotIcon allResources={allResources} />
            {mounted && (
              <Button variant="ghost"
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
              </Button>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <Button variant="ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
            aria-label="Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </Button>
          <div className="flex items-center gap-1">
            <FavoritesIcon allResources={allResources} />
            <ChatBotIcon allResources={allResources} />
            {mounted && (
              <Button variant="ghost"
                onClick={toggleTheme}
                className="p-2 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] transition-colors"
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
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--bg-primary)]">
          <nav className="container mx-auto px-4 py-3 space-y-2 max-w-5xl">
            <Link
              href="/"
              onClick={() => { clearPanels(); setMobileMenuOpen(false); }}
              className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/') && pathname === '/'
                  ? 'text-[var(--text-primary)] bg-[var(--bg-secondary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              Home
            </Link>
            <Link
              href="/tools"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/tools')
                  ? 'text-[var(--text-primary)] bg-[var(--bg-secondary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              Tools
            </Link>
            <Link
              href="/collections"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/collections')
                  ? 'text-[var(--text-primary)] bg-[var(--bg-secondary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              Collections
            </Link>
            <Link
              href="/articles"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/articles')
                  ? 'text-[var(--text-primary)] bg-[var(--bg-secondary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              Articles
            </Link>
            <Link
              href="/submit-tool"
              onClick={() => { clearPanels(); setMobileMenuOpen(false); }}
              className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/submit-tool')
                  ? 'text-[var(--text-primary)] bg-[var(--bg-secondary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              Submit a tool
            </Link>
            <Link
              href="/auto-create-tool"
              onClick={() => { clearPanels(); setMobileMenuOpen(false); }}
              className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/auto-create-tool')
                  ? 'text-[var(--text-primary)] bg-[var(--bg-secondary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }`}
            >
              Auto create tool
            </Link>
          </nav>
        </div>
      )}

      <RecentViewsSidebar 
        allResources={allResources} 
        isOpen={recentViewsOpen} 
        onClose={() => setRecentViewsOpen(false)} 
      />
    </header>
  );
}
