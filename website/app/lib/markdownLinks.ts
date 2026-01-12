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
