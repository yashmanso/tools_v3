'use client';

import { useState } from 'react';
import { TagModal } from './TagModal';

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
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className="tag cursor-pointer hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:border-blue-400 dark:hover:text-blue-300 transition-all duration-200"
            title={`Click to see all pages with tag: ${tag}`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {selectedTag && (
        <TagModal
          tag={selectedTag}
          resources={allResources}
          onClose={() => setSelectedTag(null)}
        />
      )}
    </>
  );
}
