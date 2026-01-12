'use client';

import { useState, useEffect, useRef } from 'react';

interface ExpandableContentProps {
  children: React.ReactNode;
  maxHeight?: number;
  className?: string;
  expandLabel?: string;
  collapseLabel?: string;
}

export function ExpandableContent({
  children,
  maxHeight = 200,
  className = '',
  expandLabel = 'Show more',
  collapseLabel = 'Show less',
}: ExpandableContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shouldShowButton, setShouldShowButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      const height = contentRef.current.scrollHeight;
      setShouldShowButton(height > maxHeight);
    }
  }, [maxHeight, children]);

  return (
    <div className={className}>
      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? '' : `max-h-[${maxHeight}px]`
        }`}
        style={{
          maxHeight: isExpanded ? 'none' : `${maxHeight}px`,
        }}
      >
        {children}
      </div>
      {shouldShowButton && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          {isExpanded ? collapseLabel : expandLabel}
        </button>
      )}
    </div>
  );
}
