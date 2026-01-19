import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { writeFile } from 'fs/promises';
import { slugify } from '@/app/lib/markdown';
import { parseFiles, ParsedFile } from '@/app/lib/file-parser';
import { generateToolContent, searchPerplexity } from '@/app/lib/ai-generator';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for AI processing

const CONTENT_DIRS: Record<string, string> = {
  tools: '1 – Tools, methods, frameworks, or guides',
  collections: '2 – Collections, Compendia, or Kits',
  articles: '3 – Practical academic articles and scientific reports',
};
const ATTACHMENTS_DIR = path.join(process.cwd(), 'public', 'attachments');

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
  if (Array.isArray(value)) {
    return value.map(tag => slugify(tag.replace(/^#/, '').trim())).filter(Boolean);
  }
  
  const tokens = value
    .split(/[,\n]/g)
    .flatMap((token) => token.split(/\s+/g))
    .map((token) => token.replace(/^#/, '').trim())
    .filter(Boolean)
    .map((token) => slugify(token));

  return Array.from(new Set(tokens));
};

const buildDimensionBlock = (label: string, payload?: { description: string; tags: string[] }) => {
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

const buildResourcesSection = (attachmentFilenames: string[] = []) => {
  if (attachmentFilenames.length === 0) {
    return '';
  }

  return attachmentFilenames.map(filename => `![[${filename}]]`).join('\n');
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
    const formData = await request.formData();
    const resourceType = (formData.get('resourceType')?.toString() || 'tools') as 'tools' | 'collections' | 'articles';
    const toolName = formData.get('toolName')?.toString() || '';
    const openaiKey = formData.get('openaiKey')?.toString() || '';
    const perplexityKey = formData.get('perplexityKey')?.toString() || '';
    const files = formData.getAll('files') as File[];

    if (!toolName.trim()) {
      return NextResponse.json(
        { error: `${resourceType === 'tools' ? 'Tool' : resourceType === 'collections' ? 'Collection' : 'Article'} name is required.` },
        { status: 400 }
      );
    }

    if (!openaiKey.trim()) {
      return NextResponse.json(
        { error: 'OpenAI API key is required.' },
        { status: 400 }
      );
    }

    if (!perplexityKey.trim()) {
      return NextResponse.json(
        { error: 'Perplexity API key is required.' },
        { status: 400 }
      );
    }

    if (files.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 files allowed.' },
        { status: 400 }
      );
    }

    const normalizedTitle = normalizeWhitespace(toolName);

    // Step 1: Parse uploaded files
    let parsedFiles: ParsedFile[] = [];
    if (files.length > 0) {
      try {
        parsedFiles = await parseFiles(files);
        // Filter out files that failed to parse
        parsedFiles = parsedFiles.filter(file => 
          !file.content.startsWith('[Error parsing file:') && 
          !file.content.startsWith('[Unsupported file type:')
        );
      } catch (error) {
        console.error('Error parsing files:', error);
        // Continue with empty parsed files if parsing fails completely
        parsedFiles = [];
      }
    }

    // Step 2: Search Perplexity
    let searchResults;
    try {
      let searchQuery = '';
      if (resourceType === 'tools') {
        searchQuery = `${normalizedTitle} sustainability tool method framework`;
      } else if (resourceType === 'collections') {
        searchQuery = `${normalizedTitle} sustainability toolkit collection compendium`;
      } else {
        searchQuery = `${normalizedTitle} sustainability academic article scientific paper research`;
      }
      searchResults = await searchPerplexity(searchQuery, perplexityKey);
    } catch (error) {
      console.error('Error searching Perplexity:', error);
      // Continue with empty search results
      searchResults = { content: '', sources: [] };
    }

    // Step 3: Generate content with AI
    let generatedContent;
    try {
      generatedContent = await generateToolContent(normalizedTitle, parsedFiles, searchResults, openaiKey, resourceType);
      
      // Validate generated content
      if (!generatedContent.overview || generatedContent.overview.trim().length < 50) {
        throw new Error('Generated overview is too short or empty');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if it's an API key issue
      if (errorMessage.includes('API') || errorMessage.includes('api key') || errorMessage.includes('401') || errorMessage.includes('403')) {
        return NextResponse.json(
          { error: `API authentication failed. Please check your API keys: ${errorMessage}` },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to generate content: ${errorMessage}` },
        { status: 500 }
      );
    }

    // Step 4: Save attachments
    const attachmentFilenames: string[] = [];
    if (files.length > 0) {
      try {
        await fs.mkdir(ATTACHMENTS_DIR, { recursive: true });
        
        for (const file of files) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const safeFilename = sanitizeFilename(file.name);
            const ext = path.extname(file.name);
            const nameWithoutExt = safeFilename.replace(/\.[^.]+$/, '') || `attachment-${Date.now()}`;
            const filename = await ensureUniqueFilename(ATTACHMENTS_DIR, nameWithoutExt, ext);
            const filePath = path.join(ATTACHMENTS_DIR, filename);
            await writeFile(filePath, buffer);
            attachmentFilenames.push(filename);
          } catch (fileError) {
            console.error(`Error saving file ${file.name}:`, fileError);
            // Continue with other files
          }
        }
      } catch (error) {
        console.error('Error creating attachments directory:', error);
        // Continue without attachments
      }
    }

    // Step 5: Build markdown based on resource type
    let markdown = '';
    
    if (resourceType === 'tools') {
      const dimensionSections = Object.entries(DIMENSION_LABELS)
        .map(([key, label]) => buildDimensionBlock(label, generatedContent.dimensions?.[key]))
        .filter(Boolean)
        .join('\n\n');

      const resourcesSection = buildResourcesSection(attachmentFilenames);

      markdown = [
        '___',
        '# Overview',
        generatedContent.overview || '_No overview generated._',
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
    } else if (resourceType === 'collections') {
      const resourcesSection = buildResourcesSection(attachmentFilenames);
      
      markdown = [
        '',
        generatedContent.overview || '_No description generated._',
        '',
        resourcesSection ? resourcesSection : '',
        '',
      ].join('\n');
    } else if (resourceType === 'articles') {
      const resourcesSection = buildResourcesSection(attachmentFilenames);
      
      markdown = [
        '',
        resourcesSection ? resourcesSection + '\n' : '',
        '# Abstract',
        generatedContent.overview || '_No abstract generated._',
        '',
        generatedContent.citation ? `**Citation**: ${generatedContent.citation}` : '',
        generatedContent.url ? `\n\nThe article is accessible [here](${generatedContent.url}).` : '',
        '',
        '#academic-articles',
        '',
      ].join('\n');
    }

    // Step 6: Save resource file
    let filename: string;
    let slug: string;
    try {
      const contentDir = path.join(process.cwd(), '..', CONTENT_DIRS[resourceType]);
      await fs.mkdir(contentDir, { recursive: true });
      const safeTitle = sanitizeFilename(normalizedTitle);
      const defaultName = resourceType === 'tools' ? 'New Tool' : resourceType === 'collections' ? 'New Collection' : 'New Article';
      filename = await ensureUniqueFilename(contentDir, safeTitle || slugify(normalizedTitle) || defaultName);
      await fs.writeFile(path.join(contentDir, filename), markdown, 'utf8');
      
      // Generate slug from filename (remove .md extension)
      slug = slugify(filename.replace(/\.md$/, ''));
    } catch (error) {
      console.error('Error saving tool file:', error);
      return NextResponse.json(
        { error: `Failed to save tool file: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      filename,
      slug,
      resourceType,
      attachments: attachmentFilenames,
    });
  } catch (error) {
    console.error('Auto-create tool error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create tool.' },
      { status: 500 }
    );
  }
}
