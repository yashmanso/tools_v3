'use client';

import { useEffect, useRef, useState } from 'react';

interface PreviewData {
  title: string;
  overview: string;
  category: string;
}

interface ContentWithHoverPreviewsProps {
  html: string;
  className?: string;
}

export function ContentWithHoverPreviews({ html, className }: ContentWithHoverPreviewsProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<{
    data: PreviewData;
    position: { x: number; y: number };
  } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const currentLinkRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    const handleMouseEnter = async (e: Event) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a') as HTMLAnchorElement;
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      currentLinkRef.current = link;

      // Set timeout for showing preview (2 seconds)
      timeoutRef.current = setTimeout(async () => {
        // Check if we're still hovering over the same link
        if (currentLinkRef.current !== link) return;

        try {
          // Get mouse position
          const rect = link.getBoundingClientRect();
          
          // Handle external links
          if (href.startsWith('http')) {
            setPreview({
              data: { 
                title: link.textContent || href, 
                overview: `External link: ${href}`,
                category: 'external'
              },
              position: {
                x: rect.left + rect.width / 2,
                y: rect.bottom + 8,
              },
            });
            return;
          }

          // Handle internal links - fetch the page to get metadata
          const response = await fetch(href);
          if (!response.ok) {
            // If fetch fails, show basic info
            setPreview({
              data: { 
                title: link.textContent || href, 
                overview: '',
                category: href.split('/')[1] || 'page'
              },
              position: {
                x: rect.left + rect.width / 2,
                y: rect.bottom + 8,
              },
            });
            return;
          }

          const htmlText = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(htmlText, 'text/html');

          // Extract title
          const h1 = doc.querySelector('h1');
          const title = h1?.textContent || link.textContent || '';

          // Extract overview (first paragraph)
          const article = doc.querySelector('article');
          const firstP = article?.querySelector('p');
          const overview = firstP?.textContent || '';

          // Extract category from URL
          const category = href.split('/')[1] || '';

          setPreview({
            data: { title, overview, category },
            position: {
              x: rect.left + rect.width / 2,
              y: rect.bottom + 8,
            },
          });
        } catch (error) {
          // On error, show basic preview
          const rect = link.getBoundingClientRect();
          setPreview({
            data: { 
              title: link.textContent || href, 
              overview: '',
              category: href.startsWith('http') ? 'external' : (href.split('/')[1] || 'page')
            },
            position: {
              x: rect.left + rect.width / 2,
              y: rect.bottom + 8,
            },
          });
        }
      }, 2000);
    };

    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      currentLinkRef.current = null;
      setPreview(null);
    };

    const handleClick = () => {
      // Hide preview when clicking
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }
      setPreview(null);
      currentLinkRef.current = null;
    };

    // Attach listeners to all links
    const links = contentRef.current.querySelectorAll('a');
    links.forEach((link) => {
      link.addEventListener('mouseenter', handleMouseEnter);
      link.addEventListener('mouseleave', handleMouseLeave);
      link.addEventListener('click', handleClick);
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener('mouseenter', handleMouseEnter);
        link.removeEventListener('mouseleave', handleMouseLeave);
        link.removeEventListener('click', handleClick);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [html]);

  return (
    <>
      <div
        ref={contentRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {preview && (
        <div
          className="fixed z-[100] w-80 bg-white dark:bg-gray-800 shadow-xl animate-fade-in relative"
          style={{
            left: `${preview.position.x}px`,
            top: `${preview.position.y}px`,
            transform: 'translateX(-50%)',
          }}
        >
          {/* Left border frame */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
          
          {/* Right border frame */}
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
          
          {/* Content */}
          <div className="p-4 pl-5 pr-5">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
              {preview.data.category}
            </div>
            <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {preview.data.title}
            </div>
            {preview.data.overview && (
              <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                {preview.data.overview}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
