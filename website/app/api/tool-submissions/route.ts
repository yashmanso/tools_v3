import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { slugify } from '@/app/lib/markdown';

type DimensionPayload = { description: string; tags: string[] | string };
type SubmissionPayload = {
  title?: string;
  overview?: string;
  resources?: string;
  dimensions?: Record<string, DimensionPayload>;
};

const TOOLS_DIR = path.join(process.cwd(), '..', '1 – Tools, methods, frameworks, or guides');

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
  additionalTags: 'Additional tags',
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

const buildResourcesSection = (resourcesRaw?: string) => {
  const resources = (resourcesRaw || '')
    .split(/\n+/g)
    .map((line) => line.trim())
    .filter(Boolean);

  if (resources.length === 0) {
    return '';
  }

  return resources.map((resource) => `- ${resource}`).join('\n');
};

const sanitizeFilename = (value: string) =>
  value.replace(/[\/\\?%*:|"<>]/g, '').trim();

const ensureUniqueFilename = async (dir: string, baseName: string) => {
  let candidate = baseName;
  let index = 2;
  while (true) {
    try {
      await fs.access(path.join(dir, `${candidate}.md`));
      candidate = `${baseName} (${index})`;
      index += 1;
    } catch {
      return `${candidate}.md`;
    }
  }
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SubmissionPayload;
    const title = payload.title ? normalizeWhitespace(payload.title) : '';
    const overview = payload.overview ? normalizeParagraph(payload.overview) : '';

    if (!title || !overview) {
      return NextResponse.json({ error: 'Title and overview are required.' }, { status: 400 });
    }

    const dimensionSections = Object.entries(DIMENSION_LABELS)
      .map(([key, label]) => buildDimensionBlock(label, payload.dimensions?.[key]))
      .filter(Boolean)
      .join('\n\n');

    const resourcesSection = buildResourcesSection(payload.resources);

    const markdown = [
      '___',
      '# Overview',
      overview,
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
    const safeTitle = sanitizeFilename(title);
    const filename = await ensureUniqueFilename(TOOLS_DIR, safeTitle || slugify(title) || 'New Tool');
    await fs.writeFile(path.join(TOOLS_DIR, filename), markdown, 'utf8');

    return NextResponse.json({ ok: true, filename });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit tool.' },
      { status: 500 }
    );
  }
}
