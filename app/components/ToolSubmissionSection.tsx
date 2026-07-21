'use client';

import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { TagSelector } from './TagSelector';

type DimensionKey =
  | 'resourceType'
  | 'objective'
  | 'targetAudience'
  | 'sustainabilityFocus'
  | 'innovationType'
  | 'entrepreneurshipStage'
  | 'scope'
  | 'methodology'
  | 'skillDevelopment'
  | 'sourceCredibility'
  | 'prerequisites'
  | 'collaborationLevel';

const DIMENSIONS: Array<{ key: DimensionKey; label: string; description: string }> = [
  { key: 'resourceType', label: 'Resource type', description: 'What kind of resource is this tool?' },
  { key: 'objective', label: 'Objective', description: 'What does this tool help accomplish?' },
  { key: 'targetAudience', label: 'Target audience', description: 'Who is this tool for?' },
  { key: 'sustainabilityFocus', label: 'Sustainability focus', description: 'Environmental, social, economic, etc.' },
  { key: 'innovationType', label: 'Innovation type', description: 'Product, process, business model, etc.' },
  { key: 'entrepreneurshipStage', label: 'Entrepreneurship stage', description: 'Ideation, design, growth, etc.' },
  { key: 'scope', label: 'Scope of relevance', description: 'Local, regional, global, sector-specific, etc.' },
  { key: 'methodology', label: 'Methodological approach', description: 'Framework, workshop, toolkit, analysis, etc.' },
  { key: 'skillDevelopment', label: 'Skill development', description: 'What skills does it build?' },
  { key: 'sourceCredibility', label: 'Source and credibility', description: 'Where does it come from and why is it credible?' },
  { key: 'prerequisites', label: 'Prerequisites and requirements', description: 'Knowledge or resources needed to use it.' },
  { key: 'collaborationLevel', label: 'Collaboration level', description: 'Individual, team, cross-team, etc.' },
];

const DEFAULT_DIMENSIONS: Record<DimensionKey, { description: string; tags: string[] }> = DIMENSIONS.reduce(
  (acc, dimension) => {
    acc[dimension.key] = { description: '', tags: [] };
    return acc;
  },
  {} as Record<DimensionKey, { description: string; tags: string[] }>
);

export function ToolSubmissionSection() {
  const [title, setTitle] = useState('');
  const [overview, setOverview] = useState('');
  const [resources, setResources] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dimensions, setDimensions] = useState(DEFAULT_DIMENSIONS);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [activeDimensionIndex, setActiveDimensionIndex] = useState(0);

  const [visitedDimensions, setVisitedDimensions] = useState<Set<number>>(new Set([0]));

  const dimensionProgress = Math.round(((activeDimensionIndex + 1) / DIMENSIONS.length) * 100);

  const allDimensionsVisited = visitedDimensions.size === DIMENSIONS.length;

  const isValid = useMemo(
    () => title.trim().length > 0 && overview.trim().length > 0 && allDimensionsVisited,
    [title, overview, allDimensionsVisited],
  );

  const activeDimension = DIMENSIONS[activeDimensionIndex];
  const isFirstDimension = activeDimensionIndex === 0;
  const isLastDimension = activeDimensionIndex === DIMENSIONS.length - 1;

  const handleNext = () => {
    if (!isLastDimension) {
      const next = activeDimensionIndex + 1;
      setActiveDimensionIndex(next);
      setVisitedDimensions(prev => new Set(prev).add(next));
    }
  };

  const handlePrevious = () => {
    if (!isFirstDimension) {
      const prev = activeDimensionIndex - 1;
      setActiveDimensionIndex(prev);
      setVisitedDimensions(p => new Set(p).add(prev));
    }
  };

  const handleDimensionChange = (key: DimensionKey, field: 'description', value: string) => {
    setDimensions(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleTagsChange = (key: DimensionKey, tags: string[]) => {
    setDimensions(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        tags,
      },
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(files);
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    if (!isValid || submitting) {
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('overview', overview);
      formData.append('resources', resources);
      formData.append('dimensions', JSON.stringify(dimensions));
      
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const response = await fetch('/api/tool-submissions', {
        method: 'POST',
        body: formData,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || 'Submission failed');
      }

      setStatus({
        type: 'success',
        message: 'Thanks for your submission.',
      });
      setTitle('');
      setOverview('');
      setResources('');
      setAttachments([]);
      setDimensions(DEFAULT_DIMENSIONS);
      // Reset file input
      const fileInput = document.getElementById('tool-attachments') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Submission failed',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-[var(--bg-secondary)] p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tool-title">Tool name</Label>
            <Input
              id="tool-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g., Ecodesign Strategy Wheel"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tool-resources">Resource links (one per line)</Label>
            <Textarea
              id="tool-resources"
              value={resources}
              onChange={(event) => setResources(event.target.value)}
              placeholder="https://example.com/guide.pdf"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tool-attachments">Attachments (PDFs, images, documents)</Label>
          <Input
            id="tool-attachments"
            type="file"
            multiple
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg,.gif,.svg,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
            className="cursor-pointer"
          />
          {attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Selected files ({attachments.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-primary)] rounded-lg text-sm"
                  >
                    <span className="text-gray-700 dark:text-gray-300">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      aria-label={`Remove ${file.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tool-overview">Overview</Label>
          <Textarea
            id="tool-overview"
            value={overview}
            onChange={(event) => setOverview(event.target.value)}
            placeholder="A concise summary of what the tool does and why it matters."
            rows={5}
          />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-left">
              Dimensions & tags
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {activeDimensionIndex + 1} of {DIMENSIONS.length} ({dimensionProgress}%)
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${dimensionProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-left">
            Add short descriptions and select tags from the existing list, or add custom tags as needed.
          </p>

          {/* Workflow view - one dimension at a time */}
          <div className="relative">
            {DIMENSIONS.map((dimension, index) => {
              const isActive = index === activeDimensionIndex;
              if (!isActive) return null;
              
              return (
                <div
                  key={dimension.key}
                  className="space-y-4 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 bg-[var(--bg-secondary)] shadow-lg"
                >
                  <div className="text-left">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-lg mb-1 text-left">
                      {dimension.label}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-left">{dimension.description}</p>
                  </div>
                  <Textarea
                    value={dimensions[dimension.key].description}
                    onChange={(event) => handleDimensionChange(dimension.key, 'description', event.target.value)}
                    placeholder="Short description"
                    rows={3}
                  />
                  <TagSelector
                    dimensionKey={dimension.key}
                    selectedTags={dimensions[dimension.key].tags}
                    onTagsChange={(tags) => handleTagsChange(dimension.key, tags)}
                  />
                </div>
              );
            })}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstDimension}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleNext}
              disabled={isLastDimension}
            >
              Next
            </Button>
          </div>
        </div>

        {status && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              status.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200'
                : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200'
            }`}
          >
            <p>{status.message}</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          {!allDimensionsVisited && (
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Complete all {DIMENSIONS.length} dimensions to submit ({DIMENSIONS.length - visitedDimensions.size} remaining)
            </span>
          )}
          <Button type="submit" disabled={!isValid || submitting}>
            {submitting ? 'Submitting...' : 'Submit tool'}
          </Button>
        </div>
      </form>
    </section>
  );
}
