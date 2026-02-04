/**
 * Converts markdown-style links [text](url) to HTML anchor tags
 * @param text - The text containing markdown links
 * @returns HTML string with converted links
 */
export function convertMarkdownLinksToHTML(text: string): string {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url) => {
    return `<a href="${url}" class="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
  });
}

/**
 * Normalize card preview text by stripping markdown links and bare URLs.
 */
export function formatCardOverview(text: string): string {
  if (!text) return '';
  const withoutMarkdownLinks = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
  const withoutUrls = withoutMarkdownLinks.replace(/https?:\/\/\S+|www\.\S+/gi, '');
  return withoutUrls.replace(/\s+/g, ' ').trim();
}
