'use client';

import { useState, useRef, useEffect } from 'react';
import type { ResourceMetadata } from '../lib/markdown';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  resource: ResourceMetadata;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ShareButton({ resource, size = 'md', className = '' }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const url = typeof window !== 'undefined' 
    ? `${window.location.origin}/${resource.category}/${resource.slug}`
    : '';

  // Close dropdown when clicking outside or pressing ESC
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showMenu]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowMenu(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out: ${resource.title}`);
    const body = encodeURIComponent(`I found this interesting tool:\n\n${resource.title}\n${url}\n\n${resource.overview?.substring(0, 200) || ''}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowMenu(false);
  };

  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  // Check if this is in a panel header (page-header class) - should match expand/close button style
  const isInPanelHeader = className.includes('page-header');

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button variant="ghost"
        onClick={() => setShowMenu(!showMenu)}
        className={`${sizeClasses[size]} rounded-full transition-colors ${
          isInPanelHeader
            ? 'bg-[var(--bg-primary)] hover:bg-[var(--border)] border border-[var(--border)]'
            : 'bg-[var(--bg-secondary)] hover:bg-[var(--border)] border border-[var(--border)]'
        }`}
        aria-label="Share"
        title="Share tool"
      >
        <svg 
          className={`${iconSizeClasses[size]} text-[var(--text-primary)]`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      </Button>

      {showMenu && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
          <div className="p-2 flex flex-col justify-between gap-1">
            <Button variant="ghost"
              onClick={handleCopyLink}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between gap-2 text-sm cursor-default"
            >
              <div className="flex items-center gap-2 text-red-500">
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-red-500">Copy link</span>
                  </>
                )}
              </div>
            </Button>
            <Button variant="ghost"
              onClick={handleEmailShare}
              className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between gap-2 text-sm cursor-default"
            >
              <div className="flex items-center gap-2 text-red-500">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-red-500">Share via email</span>
              </div>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
