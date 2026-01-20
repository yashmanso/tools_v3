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
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isValid = useMemo(() => title.trim().length > 0 && overview.trim().length > 0, [title, overview]);

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
        message: 'Thanks! Your tool was added and will appear shortly.',
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
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
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

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Dimensions & tags
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add short descriptions and select tags from the existing list, or add custom tags as needed.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {DIMENSIONS.map((dimension) => (
              <div key={dimension.key} className="space-y-3 rounded-2xl border border-gray-200 dark:border-gray-700 p-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {dimension.label}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{dimension.description}</p>
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
            ))}
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
            {status.message}
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={!isValid || submitting}>
            {submitting ? 'Submitting...' : 'Submit tool'}
          </Button>
        </div>
      </form>
    </section>
  );
}
