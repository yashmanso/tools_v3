'use client';

import { useTagModal } from './TagModalContext';

interface Resource {
  slug: string;
  title: string;
  category: string;
  tags: string[];
}

interface TagListProps {
  tags: string[];
  allResources: Resource[];
}

export function TagList({ tags, allResources }: TagListProps) {
  const { openTag, setOpenTag } = useTagModal();

  const handleTagClick = (tag: string) => {
    // Toggle: if already open, close it; otherwise open it
    setOpenTag(openTag === tag ? null : tag);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {tags.length === 0 ? (
        <span className="text-sm text-gray-500 dark:text-gray-400">No tags available</span>
      ) : (
        tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => handleTagClick(tag)}
            className="tag cursor-pointer hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:border-blue-400 dark:hover:text-blue-300 transition-all duration-200 active:scale-95"
            title={`Click to see all pages with tag: ${tag}`}
          >
            {tag}
          </button>
        ))
      )}
    </div>
  );
}
