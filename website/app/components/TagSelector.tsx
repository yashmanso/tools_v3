'use client';

import { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TAG_GLOSSARY } from '../lib/tagGlossary';
import { slugify } from '../lib/slugify';

interface TagSelectorProps {
  dimensionKey: string;
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
}

export function TagSelector({ dimensionKey, selectedTags, onTagsChange }: TagSelectorProps) {
  const [customTagInput, setCustomTagInput] = useState('');
  const availableTags = TAG_GLOSSARY[dimensionKey] || [];
  const customTags = useMemo(
    () => selectedTags.filter(tag => !availableTags.includes(tag)),
    [selectedTags, availableTags]
  );

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = () => {
    const normalized = slugify(customTagInput.trim());
    if (normalized && !selectedTags.includes(normalized)) {
      onTagsChange([...selectedTags, normalized]);
      setCustomTagInput('');
    }
  };

  const handleRemoveCustomTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  const selectedExistingTags = useMemo(
    () => selectedTags.filter(tag => availableTags.includes(tag)),
    [selectedTags, availableTags]
  );

  return (
    <div className="space-y-3">
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div>
          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
            Selected tags:
          </Label>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => {
              const isExisting = availableTags.includes(tag);
              return (
                <Badge
                  key={tag}
                  variant={isExisting ? "default" : "outline"}
                  className="flex items-center gap-1 pr-1"
                >
                  <span>{tag.replace(/-/g, ' ')}</span>
                  <button
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                    aria-label={`Remove ${tag}`}
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Existing tags checkboxes */}
      {availableTags.length > 0 && (
        <div>
          <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
            Select from existing tags:
          </Label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
            {availableTags.map((tag) => (
              <label
                key={tag}
                className="flex items-center gap-2 cursor-pointer group px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Checkbox
                  checked={selectedTags.includes(tag)}
                  onCheckedChange={() => handleTagToggle(tag)}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                  {tag.replace(/-/g, ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Custom tags input */}
      <div>
        <Label className="text-xs text-gray-600 dark:text-gray-400 mb-2 block">
          Add custom tags:
        </Label>
        <div className="flex gap-2">
          <Input
            value={customTagInput}
            onChange={(e) => setCustomTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCustomTag();
              }
            }}
            placeholder="Type custom tag and press Enter"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddCustomTag}
            disabled={!customTagInput.trim()}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}
