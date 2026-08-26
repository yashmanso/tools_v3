'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

const STORAGE_KEY = 'exitIntentLastShown';
const DAYS_BETWEEN_SHOWS = 30;

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const shouldShowPopup = useCallback(() => {
    try {
      const lastShown = localStorage.getItem(STORAGE_KEY);
      if (!lastShown) return true;

      const lastShownDate = new Date(parseInt(lastShown, 10));
      const now = new Date();
      const daysSinceLastShown = Math.floor(
        (now.getTime() - lastShownDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysSinceLastShown >= DAYS_BETWEEN_SHOWS;
    } catch {
      return true;
    }
  }, []);

  const markAsShown = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // localStorage not available
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    markAsShown();
  }, [markAsShown]);

  const handleFeedbackClick = useCallback(() => {
    setIsVisible(false);
    markAsShown();
  }, [markAsShown]);

  useEffect(() => {
    if (hasTriggered) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse moves to the top of the viewport (exit intent)
      if (e.clientY <= 5 && shouldShowPopup()) {
        setIsVisible(true);
        setHasTriggered(true);
      }
    };

    // Add a small delay before enabling exit intent detection
    const timeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasTriggered, shouldShowPopup]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, handleClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>

        {/* Content */}
        <div className="text-center">
          <div className="text-4xl mb-4">👋</div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Before you go...
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 leading-relaxed">
            We'd love to hear your thoughts! Your feedback helps us improve the
            Sustainability Atlas for everyone.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/survey"
              onClick={handleFeedbackClick}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Leave feedback
            </Link>
            <button
              onClick={handleClose}
              className="px-6 py-3 border border-[var(--border)] hover:bg-gray-50 dark:hover:bg-gray-800 text-[var(--text-primary)] font-medium rounded-lg transition-colors"
            >
              Maybe later
            </button>
          </div>

          <p className="text-xs text-[var(--text-muted)] mt-4">
            Takes less than 2 minutes
          </p>
        </div>
      </div>
    </div>
  );
}
