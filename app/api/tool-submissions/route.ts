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

const TOOLS_CATEGORY_DIR = 'Content/1 – Tools, methods, frameworks, or guides';
const TOOLS_DIR = path.join(process.cwd(), TOOLS_CATEGORY_DIR);
const ATTACHMENTS_PUBLIC_DIR = 'public/attachments';
const ATTACHMENTS_DIR = path.join(process.cwd(), ATTACHMENTS_PUBLIC_DIR);
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'yashmanso';
const GITHUB_REPO = process.env.GITHUB_REPO || 'tools_v3';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

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

const encodeGitHubPath = (value: string) =>
  value
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');

const getGitHubApiUrl = (filePath: string) =>
  `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeGitHubPath(filePath)}`;

const getGitHubHeaders = (githubToken: string) => ({
  Authorization: `Bearer ${githubToken}`,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'tools-v3-tool-submissions',
});

const getGitHubFileSha = async (filePath: string, githubToken: string): Promise<string | undefined> => {
  const response = await fetch(getGitHubApiUrl(filePath), {
    method: 'GET',
    headers: getGitHubHeaders(githubToken),
  });

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error(`GitHub lookup failed for ${filePath}: ${response.status}`);
  }

  const payload = await response.json();
  return payload.sha as string | undefined;
};

const ensureUniqueGitHubFilename = async (
  dir: string,
  baseName: string,
  githubToken: string,
  extension?: string,
): Promise<string> => {
  const ext = extension || '.md';
  const nameWithoutExt = baseName.replace(/\.[^.]+$/, '');
  let candidate = `${nameWithoutExt}${ext}`;
  let index = 2;

  while (true) {
    const candidatePath = `${dir}/${candidate}`;
    const sha = await getGitHubFileSha(candidatePath, githubToken);
    if (!sha) {
      return candidate;
    }
    candidate = `${nameWithoutExt} (${index})${ext}`;
    index += 1;
  }
};

const saveGitHubFile = async (
  filePath: string,
  content: Buffer | string,
  message: string,
  githubToken: string,
) => {
  const sha = await getGitHubFileSha(filePath, githubToken);
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
  const response = await fetch(getGitHubApiUrl(filePath), {
    method: 'PUT',
    headers: getGitHubHeaders(githubToken),
    body: JSON.stringify({
      message,
      content: buffer.toString('base64'),
      branch: GITHUB_BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`GitHub save failed for ${filePath}: ${details}`);
  }
};

const createGitHubNotificationIssue = async ({
  githubToken,
  title,
  pageUrl,
  githubFileUrl,
  submitterTitle,
}: {
  githubToken: string;
  title: string;
  pageUrl: string;
  githubFileUrl: string;
  submitterTitle: string;
}): Promise<string | null> => {
  try {
    const response = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: getGitHubHeaders(githubToken),
      body: JSON.stringify({
        title,
        body: [
          'A new tool page was created from the submit form.',
          '',
          `- Tool: ${submitterTitle}`,
          `- Site page: ${pageUrl}`,
          `- GitHub file: ${githubFileUrl}`,
          `- Branch: ${GITHUB_BRANCH}`,
        ].join('\n'),
        labels: ['tool-submission'],
      }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return payload.html_url || null;
  } catch {
    return null;
  }
};

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

    const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
    const githubToken = process.env.GITHUB_TOKEN;
    if (isProduction && !githubToken) {
      return NextResponse.json(
        { error: 'GITHUB_TOKEN is not configured. Please set it in the deployment environment.' },
        { status: 500 },
      );
    }

    // Save attachments
    const attachmentFilenames: string[] = [];
    if (attachments.length > 0) {
      for (const file of attachments) {
        const safeFilename = sanitizeFilename(file.name);
        const ext = path.extname(file.name);
        const nameWithoutExt = safeFilename.replace(/\.[^.]+$/, '') || `attachment-${Date.now()}`;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        let filename: string;
        if (isProduction) {
          filename = await ensureUniqueGitHubFilename(ATTACHMENTS_PUBLIC_DIR, nameWithoutExt, githubToken!, ext);
          await saveGitHubFile(
            `${ATTACHMENTS_PUBLIC_DIR}/${filename}`,
            buffer,
            `Add attachment for tool submission: ${normalizedTitle}`,
            githubToken!,
          );
        } else {
          await fs.mkdir(ATTACHMENTS_DIR, { recursive: true });
          filename = await ensureUniqueFilename(ATTACHMENTS_DIR, nameWithoutExt, ext);
          const filePath = path.join(ATTACHMENTS_DIR, filename);
          await writeFile(filePath, buffer);
        }

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

    const safeTitle = sanitizeFilename(normalizedTitle);
    const baseTitle = safeTitle || slugify(normalizedTitle) || 'New Tool';
    let filename = '';

    if (isProduction) {
      filename = await ensureUniqueGitHubFilename(TOOLS_CATEGORY_DIR, baseTitle, githubToken!, '.md');
      await saveGitHubFile(
        `${TOOLS_CATEGORY_DIR}/${filename}`,
        markdown,
        `Add tool submission: ${filename}`,
        githubToken!,
      );
    } else {
      await fs.mkdir(TOOLS_DIR, { recursive: true });
      filename = await ensureUniqueFilename(TOOLS_DIR, baseTitle, '.md');
      await fs.writeFile(path.join(TOOLS_DIR, filename), markdown, 'utf8');
    }

    const slug = slugify(filename.replace(/\.md$/, ''));
    const pageUrl = `/tools/${slug}`;
    const githubFileUrl = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/blob/${GITHUB_BRANCH}/${encodeGitHubPath(
      `${TOOLS_CATEGORY_DIR}/${filename}`,
    )}`;

    const notificationIssueUrl =
      isProduction && githubToken
        ? await createGitHubNotificationIssue({
            githubToken,
            title: `New tool page created: ${filename.replace(/\.md$/, '')}`,
            pageUrl,
            githubFileUrl,
            submitterTitle: normalizedTitle,
          })
        : null;

    return NextResponse.json({
      ok: true,
      filename,
      attachments: attachmentFilenames,
      pageUrl,
      githubFileUrl,
      notificationIssueUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit tool.' },
      { status: 500 }
    );
  }
}
