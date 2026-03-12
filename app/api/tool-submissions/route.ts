import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { writeFile } from 'fs/promises';
import { slugify } from '@/app/lib/slugify';

// Force dynamic rendering since we're writing to file system
export const dynamic = 'force-dynamic';

type DimensionPayload = { description: string; tags: string[] | string };
type SubmissionPayload = {
  title?: string;
  overview?: string;
  resources?: string;
  dimensions?: Record<string, DimensionPayload>;
};

// Submissions are first written to a dedicated submissions folder.
// You can later review and move these markdown files (and any attachments)
// into the appropriate Content subfolder when you want them to appear on the site.
const SUBMISSIONS_DIR = path.join(process.cwd(), 'submissions');
// Markdown files for new tools are written directly under the submissions folder
// using the submitted tool name (with de-duplicated filenames).
const TOOLS_DIR = SUBMISSIONS_DIR;
const ATTACHMENTS_DIR = path.join(SUBMISSIONS_DIR, 'attachments');

const DIMENSION_LABELS: Record<string, string> = {
  resourceType: 'Resource type',
  objective: 'Objective',
  targetAudience: 'Target audience',
  sustainabilityFocus: 'Sustainability focus',
  innovationType: 'Innovation type',
  entrepreneurshipStage: 'Entrepreneurship stage',
  scope: 'Scope of relevance',
  methodology: 'Methodological approach',
  skillDevelopment: 'Skill development',
  sourceCredibility: 'Source and credibility',
  prerequisites: 'Prerequisites and requirements',
  collaborationLevel: 'Collaboration level',
};

const normalizeWhitespace = (value: string) =>
  value.replace(/\s+/g, ' ').trim();

const sentenceCase = (value: string) => {
  if (!value) return value;
  const trimmed = value.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const normalizeParagraph = (value: string) => {
  const normalized = normalizeWhitespace(value);
  if (!normalized) return '';
  const withCase = sentenceCase(normalized);
  return /[.!?]$/.test(withCase) ? withCase : `${withCase}.`;
};

const normalizeTags = (value: string[] | string) => {
  // Handle array input (from new tag selector)
  if (Array.isArray(value)) {
    return value.map(tag => slugify(tag.replace(/^#/, '').trim())).filter(Boolean);
  }
  
  // Handle string input (backward compatibility)
  const tokens = value
    .split(/[,\n]/g)
    .flatMap((token) => token.split(/\s+/g))
    .map((token) => token.replace(/^#/, '').trim())
    .filter(Boolean)
    .map((token) => slugify(token));

  return Array.from(new Set(tokens));
};

const buildDimensionBlock = (label: string, payload?: DimensionPayload) => {
  const description = payload?.description ? normalizeParagraph(payload.description) : '';
  const tags = payload?.tags ? normalizeTags(payload.tags) : [];
  if (!description && tags.length === 0) {
    return '';
  }

  const lines = [`**${label}:**`, description || ''];
  if (tags.length > 0) {
    lines.push(`- Tags: ${tags.map((tag) => `#${tag}`).join(' ')}`);
  }
  return lines.filter(Boolean).join('\n');
};

const buildResourcesSection = (resourcesRaw?: string, attachmentFilenames: string[] = []) => {
  const resources = (resourcesRaw || '')
    .split(/\n+/g)
    .map((line) => line.trim())
    .filter(Boolean);

  const allResources = [
    ...resources,
    ...attachmentFilenames.map(filename => `![[${filename}]]`),
  ];

  if (allResources.length === 0) {
    return '';
  }

  return allResources.map((resource) => {
    // If it's already a markdown attachment reference, use it as-is
    if (resource.startsWith('![')) {
      return resource;
    }
    // Otherwise, format as a list item
    return `- ${resource}`;
  }).join('\n');
};

const sanitizeFilename = (value: string) =>
  value.replace(/[\/\\?%*:|"<>]/g, '').trim();

const ensureUniqueFilename = async (dir: string, baseName: string, extension?: string) => {
  const ext = extension || '.md';
  const nameWithoutExt = baseName.replace(/\.[^.]+$/, '');
  let candidate = `${nameWithoutExt}${ext}`;
  let index = 2;
  
  while (true) {
    const fullPath = path.join(dir, candidate);
    try {
      await fs.access(fullPath);
      candidate = `${nameWithoutExt} (${index})${ext}`;
      index += 1;
    } catch {
      return candidate;
    }
  }
};

export async function POST(request: Request) {
  try {
    // In serverless production environments (e.g. Vercel), the deployment
    // filesystem under /var/task is read-only. This endpoint is intended
    // for local authoring only, where submissions are written into the repo.
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        {
          error:
            'Tool submissions are only supported in the local development environment. ' +
            'Please run the site locally to submit a tool, then commit the generated files under the submissions folder.',
        },
        { status: 400 },
      );
    }

    const formData = await request.formData();
    const title = formData.get('title')?.toString() || '';
    const overview = formData.get('overview')?.toString() || '';
    const resources = formData.get('resources')?.toString() || '';
    const dimensionsRaw = formData.get('dimensions')?.toString() || '{}';
    const attachments = formData.getAll('attachments') as File[];

    const normalizedTitle = normalizeWhitespace(title);
    const normalizedOverview = normalizeParagraph(overview);

    if (!normalizedTitle || !normalizedOverview) {
      return NextResponse.json({ error: 'Title and overview are required.' }, { status: 400 });
    }

    // Parse dimensions
    let dimensions: Record<string, DimensionPayload> = {};
    try {
      dimensions = JSON.parse(dimensionsRaw);
    } catch {
      // If parsing fails, use empty object
    }

    // Save attachments
    const attachmentFilenames: string[] = [];
    if (attachments.length > 0) {
      await fs.mkdir(ATTACHMENTS_DIR, { recursive: true });
      
      for (const file of attachments) {
        const safeFilename = sanitizeFilename(file.name);
        const ext = path.extname(file.name);
        const nameWithoutExt = safeFilename.replace(/\.[^.]+$/, '') || `attachment-${Date.now()}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const filename = await ensureUniqueFilename(ATTACHMENTS_DIR, nameWithoutExt, ext);
        const filePath = path.join(ATTACHMENTS_DIR, filename);
        await writeFile(filePath, buffer);
        attachmentFilenames.push(filename);
      }
    }

    const dimensionSections = Object.entries(DIMENSION_LABELS)
      .map(([key, label]) => buildDimensionBlock(label, dimensions[key]))
      .filter(Boolean)
      .join('\n\n');

    const resourcesSection = buildResourcesSection(resources, attachmentFilenames);

    const markdown = [
      '___',
      '# Overview',
      normalizedOverview,
      '',
      '___',
      '# Dimensions',
      '',
      dimensionSections || '_No dimensions provided._',
      '',
      '___',
      '# Resources',
      '',
      resourcesSection || '_No resources provided._',
      '',
    ].join('\n');

    await fs.mkdir(TOOLS_DIR, { recursive: true });
    const safeTitle = sanitizeFilename(normalizedTitle);
    const filename = await ensureUniqueFilename(TOOLS_DIR, safeTitle || slugify(normalizedTitle) || 'New Tool');
    await fs.writeFile(path.join(TOOLS_DIR, filename), markdown, 'utf8');

    return NextResponse.json({ ok: true, filename, attachments: attachmentFilenames });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit tool.' },
      { status: 500 }
    );
  }
}
