'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ResourceMetadata } from '../lib/markdown';

interface PreviewData {
  title: string;
  items: Array<{ title: string; href: string }>;
  category: string;
  totalCount?: number;
}

interface HeaderLinkWithPreviewProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  allResources?: ResourceMetadata[];
}

export function HeaderLinkWithPreview({ href, children, className, onClick, allResources = [] }: HeaderLinkWithPreviewProps) {
  const [preview, setPreview] = useState<{
    data: PreviewData;
    position: { x: number; y: number };
  } | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isHoveringRef = useRef(false);

  const calculatePosition = (link: HTMLAnchorElement) => {
    const rect = link.getBoundingClientRect();
    const previewWidth = 320; // w-80 = 320px
    const previewHeight = 400; // estimated max height
    const spacing = 4; // Smaller gap to prevent mouse leave
    
    let x = rect.left + rect.width / 2;
    let y = rect.bottom + spacing;
    
    // Keep preview within viewport horizontally
    if (x - previewWidth / 2 < 0) {
      x = previewWidth / 2 + 16; // 16px padding from edge
    } else if (x + previewWidth / 2 > window.innerWidth) {
      x = window.innerWidth - previewWidth / 2 - 16;
    }
    
    // If preview would go below viewport, show above link instead
    if (y + previewHeight > window.innerHeight) {
      y = rect.top - previewHeight - spacing;
      // Make sure it doesn't go above viewport
      if (y < 0) {
        y = 16;
      }
    }
    
    return { x, y };
  };

  const showPreview = (link: HTMLAnchorElement) => {
    const position = calculatePosition(link);
    
    // Handle external links
    if (href.startsWith('http')) {
      setPreview({
        data: { 
          title: link.textContent || href, 
          items: [],
          category: 'external'
        },
        position,
      });
      return;
    }

    // Extract category from URL
    const category = href.split('/')[1] || '';
    
    // If we have allResources, use them to show the list
    if (allResources.length > 0 && category) {
      const categoryResources = allResources.filter(r => r.category === category);
      const items = categoryResources.slice(0, 10).map(resource => ({
        title: resource.title,
        href: `/${resource.category}/${resource.slug}`
      }));
      
      setPreview({
        data: {
          title: link.textContent || category,
          items,
          category,
          totalCount: categoryResources.length
        },
        position,
      });
      return;
    }

    // Fallback: fetch the page
    fetch(href)
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch');
        return response.text();
      })
      .then(htmlText => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        
        // Extract title
        const h1 = doc.querySelector('h1');
        const title = h1?.textContent || link.textContent || '';
        
        // Extract list items from ResourceCard links
        const resourceLinks = doc.querySelectorAll('a[href*="/tools/"], a[href*="/collections/"], a[href*="/articles/"]');
        const items: Array<{ title: string; href: string }> = [];
        
        resourceLinks.forEach((linkEl) => {
          const href = linkEl.getAttribute('href') || '';
          const title = linkEl.textContent?.trim() || '';
          if (href && title && !items.find(item => item.href === href)) {
            items.push({ title, href });
          }
        });
        
        setPreview({
          data: {
            title,
            items: items.slice(0, 10),
            category,
            totalCount: items.length
          },
          position,
        });
      })
      .catch(() => {
        // On error, show basic preview
        setPreview({
          data: { 
            title: link.textContent || category, 
            items: [],
            category
          },
          position,
        });
      });
  };

  const hideTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const link = e.currentTarget;
    
    // Cancel any pending hide
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }
    
    isHoveringRef.current = true;
    
    // Clear any existing show timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set timeout for showing preview (600ms for header links - faster)
    timeoutRef.current = setTimeout(() => {
      // Only show if still hovering and link is connected
      if (isHoveringRef.current && link.isConnected) {
        showPreview(link);
      }
    }, 600);
  };

  const handleMouseLeave = () => {
    // Clear show timeout first
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    
    // Don't set isHoveringRef to false immediately - wait to see if mouse moves to preview
    // Clear any existing hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    // Set hide timeout with delay
    hideTimeoutRef.current = setTimeout(() => {
      // Only hide if we're still not hovering (mouse didn't move to preview)
      if (!isHoveringRef.current) {
        setPreview(null);
      }
    }, 250); // 250ms delay - gives time to move to preview
  };

  const handlePreviewMouseEnter = () => {
    // Cancel hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
    }
    isHoveringRef.current = true;
  };

  const handlePreviewMouseLeave = () => {
    isHoveringRef.current = false;
    
    // Clear any existing timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    
    // Delay hiding
    hideTimeoutRef.current = setTimeout(() => {
      if (!isHoveringRef.current) {
        setPreview(null);
      }
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <Link
        href={href}
        onClick={onClick}
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </Link>

      {preview && (
        <div
          data-preview-box
          className="fixed z-50 w-80 max-h-96 bg-white dark:bg-gray-800 shadow-xl relative overflow-hidden flex flex-col"
          style={{
            left: `${preview.position.x}px`,
            top: `${preview.position.y}px`,
            transform: 'translateX(-50%)',
            animation: 'fadeIn 0.2s ease-in',
          }}
          onMouseEnter={handlePreviewMouseEnter}
          onMouseLeave={handlePreviewMouseLeave}
        >
          {/* Left border frame */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
          
          {/* Right border frame */}
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
          
          {/* Content */}
          <div className="p-4 pl-5 pr-5 flex-shrink-0 border-b border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">
              {preview.data.category}
            </div>
            <div className="font-semibold text-gray-900 dark:text-gray-100">
              {preview.data.title}
            </div>
            {preview.data.totalCount !== undefined && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {preview.data.totalCount} {preview.data.totalCount === 1 ? 'item' : 'items'}
              </div>
            )}
          </div>
          
          {/* Items list */}
          {preview.data.items.length > 0 && (
            <div className="flex-1 overflow-y-auto">
              <div className="p-2 pl-5 pr-5">
                <ul className="space-y-1">
                  {preview.data.items.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="block text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreview(null);
                        }}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
                {preview.data.totalCount && preview.data.totalCount > preview.data.items.length && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-center">
                    +{preview.data.totalCount - preview.data.items.length} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
