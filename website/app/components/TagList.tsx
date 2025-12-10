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
            className="tag cursor-pointer hover:bg-blue-600 hover:border-blue-600 dark:hover:bg-blue-500 dark:hover:border-blue-500 transition-colors"
          >
            {tag}
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
