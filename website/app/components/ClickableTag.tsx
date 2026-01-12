'use client';

import { useTagModal } from './TagModalContext';
import { ResourceMetadata } from '../lib/markdown';

interface ClickableTagProps {
  tag: string;
  allResources: ResourceMetadata[];
  className?: string;
  size?: 'xs' | 'sm';
}

export function ClickableTag({ tag, allResources, className = '', size = 'xs' }: ClickableTagProps) {
  const { openTag, setOpenTag } = useTagModal();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Toggle: if already open, close it; otherwise open it
    setOpenTag(openTag === tag ? null : tag);
  };

  const sizeClasses = {
    xs: 'text-xs px-2 py-1',
    sm: 'text-sm px-2.5 py-1',
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`tag cursor-pointer hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:border-blue-400 dark:hover:text-blue-300 transition-all duration-200 active:scale-95 ${sizeClasses[size]} ${className}`}
      title={`Click to see all pages with tag: ${tag}`}
    >
      {tag}
    </button>
  );
}

