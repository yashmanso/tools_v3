'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
  message: string;
  duration?: number; // if omitted, stays open until dismissed (click backdrop or Esc)
  onClose: () => void;
}

export function Toast({ message, duration, onClose }: ToastProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Trigger modal animation on next frame (backdrop shows immediately)
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const timer =
      typeof duration === 'number'
        ? window.setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for fade-out animation
          }, duration)
        : undefined;

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (typeof timer === 'number') window.clearTimeout(timer);
    };
  }, [duration, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-md"
        onMouseDown={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
      />

      {/* Modal */}
      <div
        className={`relative mx-4 w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] shadow-2xl px-6 py-5 transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-[var(--text-primary)] text-center leading-relaxed">
          {message}
        </p>
      </div>
    </div>,
    document.body
  );
}
