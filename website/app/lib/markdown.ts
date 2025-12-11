import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';

const contentDirectory = path.join(process.cwd(), '..');

export interface ResourceMetadata {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  overview?: string;
  dimensions?: Record<string, any>;
}

export interface Attachment {
  filename: string;
  type: 'pdf' | 'image' | 'other';
  url: string;
}

export interface Resource extends ResourceMetadata {
  contentHtml: string;
  attachments: Attachment[];
}

// Convert Obsidian wiki-links to markdown links
function convertWikiLinks(content: string): string {
  // Handle image/file attachments: ![[file]]
  content = content.replace(/!\[\[([^\]]+)\]\]/g, (match, filename) => {
    const encodedFilename = encodeURIComponent(filename);
    const extension = filename.split('.').pop()?.toLowerCase() || '';

    // PDFs should be embedded inline
    if (extension === 'pdf') {
      return `<div class="pdf-embed my-8"><iframe src="/attachments/${encodedFilename}" class="w-full h-[600px] border border-gray-300 dark:border-gray-700 rounded-lg" title="${filename}"></iframe></div>`;
    }

    // Images should use img tag
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) {
      const altText = filename.replace(/\.[^.]+$/, '');
      return `![${altText}](/attachments/${encodedFilename})`;
    }

    // Other files as embedded iframes
    return `<div class="file-embed my-8"><iframe src="/attachments/${encodedFilename}" class="w-full h-[600px] border border-gray-300 dark:border-gray-700 rounded-lg" title="${filename}"></iframe></div>`;
  });

  // Handle [[link|display text]] format
  content = content.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (match, link, display) => {
    const slug = link.split('/').pop()?.replace(/\.md$/, '') || link;
    return `[${display}](/${getCategory(link)}/${slugify(slug)})`;
  });

  // Handle [[link]] format
  content = content.replace(/\[\[([^\]]+)\]\]/g, (match, link) => {
    const displayText = link.split('/').pop()?.replace(/\.md$/, '') || link;
    const slug = slugify(displayText);
    return `[${displayText}](/${getCategory(link)}/${slug})`;
  });

  return content;
}

// Remove # from tags in content, keeping just the tag name
function stripHashFromTags(content: string): string {
  // Replace #tag-name with just tag-name (but not in URLs or code blocks)
  // Match # followed by word characters and hyphens, but not preceded by [ or (
  return content.replace(/(?<![(\[])\B#([\w-]+)/g, '$1');
}

// Get category from file path
function getCategory(filePath: string): string {
  if (filePath.includes('1 –') || filePath.toLowerCase().includes('tool')) return 'tools';
  if (filePath.includes('2 –') || filePath.toLowerCase().includes('collection')) return 'collections';
  if (filePath.includes('3 –') || filePath.toLowerCase().includes('article')) return 'articles';
  return 'tools';
}

// Create URL-friendly slug
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

// Extract tags from content
function extractTags(content: string): string[] {
  const tagRegex = /#([\w-]+)/g;
  const tags = new Set<string>();
  let match;

  while ((match = tagRegex.exec(content)) !== null) {
    tags.add(match[1]);
  }

  return Array.from(tags);
}

// Parse dimensions from markdown content
function parseDimensions(content: string): Record<string, any> {
  const dimensions: Record<string, any> = {};
  const sections = content.split(/^##\s+/m);

  for (const section of sections) {
    const lines = section.split('\n');
    const title = lines[0]?.trim();

    if (title && title !== 'Overview' && title !== 'Resources') {
      const sectionContent = lines.slice(1).join('\n');
      dimensions[title] = sectionContent.trim();
    }
  }

  return dimensions;
}

// Extract attachments from content
function extractAttachments(content: string): Attachment[] {
  const attachments: Attachment[] = [];
  const attachmentRegex = /!\[\[([^\]]+)\]\]/g;
  let match;

  while ((match = attachmentRegex.exec(content)) !== null) {
    const filename = match[1];
    const extension = filename.split('.').pop()?.toLowerCase() || '';

    let type: 'pdf' | 'image' | 'other' = 'other';
    if (extension === 'pdf') {
      type = 'pdf';
    } else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) {
      type = 'image';
    }

    attachments.push({
      filename,
      type,
      url: `/attachments/${encodeURIComponent(filename)}`,
    });
  }

  return attachments;
}

// Separate content from Resources section
function separateContentAndResources(content: string): {
  mainContent: string;
  resourcesContent: string;
} {
  // Split on Resources heading
  const resourcesMatch = content.match(/^#+\s*Resources\s*$/im);

  if (!resourcesMatch || !resourcesMatch.index) {
    return { mainContent: content, resourcesContent: '' };
  }

  const mainContent = content.substring(0, resourcesMatch.index).trim();
  const resourcesContent = content.substring(resourcesMatch.index).trim();

  return { mainContent, resourcesContent };
}

// Get all resources from a category directory
export function getResourcesByCategory(category: string): ResourceMetadata[] {
  const categoryMap: Record<string, string> = {
    tools: '1 – Tools, methods, frameworks, or guides',
    collections: '2 – Collections, Compendia, or Kits',
    articles: '3 – Practical academic articles and scientific reports',
  };

  const dirPath = path.join(contentDirectory, categoryMap[category] || '');

  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);

  const resources = files
    .filter((file) => file.endsWith('.md') && !file.startsWith('_'))
    .map((file) => {
      const fullPath = path.join(dirPath, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      const title = file.replace(/\.md$/, '');
      const slug = slugify(title);

      // Extract overview - look for content after "# Overview" or first paragraph
      let overview = '';

      // Try to find Overview section specifically
      const overviewSectionMatch = content.match(/#+\s*Overview\s*\n+([^\n]+(?:\n(?!#+|___)[^\n]+)*)/i);
      if (overviewSectionMatch) {
        overview = overviewSectionMatch[1].trim();
      } else {
        // Fallback: get first substantial paragraph (skip horizontal rules and empty lines)
        const cleanContent = content.replace(/^___+\s*/gm, '').replace(/^#+[^\n]*\n+/m, '');
        const firstParagraphMatch = cleanContent.match(/^([^\n]+(?:\n(?!\n|#+|___)[^\n]+)*)/);
        if (firstParagraphMatch) {
          overview = firstParagraphMatch[1].trim();
        }
      }

      return {
        slug,
        title,
        category,
        tags: extractTags(content),
        overview,
        dimensions: parseDimensions(content),
      };
    });

  return resources;
}

// Get all resources from all categories
export function getAllResources(): ResourceMetadata[] {
  const categories = ['tools', 'collections', 'articles'];
  const allResources: ResourceMetadata[] = [];

  categories.forEach((category) => {
    const resources = getResourcesByCategory(category);
    allResources.push(...resources);
  });

  return allResources;
}

// Get a single resource by slug and category
export async function getResourceBySlug(
  category: string,
  slug: string
): Promise<Resource | null> {
  const categoryMap: Record<string, string> = {
    tools: '1 – Tools, methods, frameworks, or guides',
    collections: '2 – Collections, Compendia, or Kits',
    articles: '3 – Practical academic articles and scientific reports',
  };

  const dirPath = path.join(contentDirectory, categoryMap[category] || '');

  if (!fs.existsSync(dirPath)) {
    return null;
  }

  const files = fs.readdirSync(dirPath);
  const file = files.find((f) => slugify(f.replace(/\.md$/, '')) === slug);

  if (!file) {
    return null;
  }

  const fullPath = path.join(dirPath, file);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const title = file.replace(/\.md$/, '');

  // Separate main content from Resources section
  const { mainContent, resourcesContent } = separateContentAndResources(content);

  // Extract attachments only from Resources section (not inline images from main content)
  const attachments = extractAttachments(resourcesContent);

  // Convert wiki links and inline images before processing markdown - include both main and resources
  // Also strip # from tags to show clean tag names
  const convertedMainContent = stripHashFromTags(convertWikiLinks(mainContent));
  const convertedResourcesContent = stripHashFromTags(convertWikiLinks(resourcesContent));
  const fullConvertedContent = convertedMainContent + '\n\n' + convertedResourcesContent;

  // Process markdown to HTML
  const processedContent = await remark()
    .use(gfm)
    .use(html, { sanitize: false })
    .process(fullConvertedContent);

  const contentHtml = processedContent.toString();

  // Extract overview - look for content after "# Overview" or first paragraph
  let overview = '';

  // Try to find Overview section specifically
  const overviewSectionMatch = content.match(/#+\s*Overview\s*\n+([^\n]+(?:\n(?!#+|___)[^\n]+)*)/i);
  if (overviewSectionMatch) {
    overview = overviewSectionMatch[1].trim();
  } else {
    // Fallback: get first substantial paragraph (skip horizontal rules and empty lines)
    const cleanContent = content.replace(/^___+\s*/gm, '').replace(/^#+[^\n]*\n+/m, '');
    const firstParagraphMatch = cleanContent.match(/^([^\n]+(?:\n(?!\n|#+|___)[^\n]+)*)/);
    if (firstParagraphMatch) {
      overview = firstParagraphMatch[1].trim();
    }
  }

  return {
    slug,
    title,
    category,
    tags: extractTags(content),
    overview,
    dimensions: parseDimensions(content),
    contentHtml,
    attachments,
  };
}
