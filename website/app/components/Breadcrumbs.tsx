'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbsProps {
  currentPageTitle?: string;
}

export function Breadcrumbs({ currentPageTitle }: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Don't show breadcrumbs on homepage
  if (pathname === '/') {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs = [
    { label: 'Home', href: '/' },
    ...segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      
      // Use provided title if this is the last segment and title is provided
      if (index === segments.length - 1 && currentPageTitle && segments.length === 2) {
        return { label: currentPageTitle, href };
      }
      
      // Capitalize and format segment
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { label, href };
    }),
  ];

  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          
          return (
            <li key={crumb.href} className="flex items-center gap-2">
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              {isLast ? (
                <span className="text-gray-900 dark:text-gray-100 font-medium">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
