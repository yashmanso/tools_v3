import type { ResourceMetadata } from './markdown';
import type { Facet } from './chatFacets';

export interface Match {
  resource: ResourceMetadata;
  score: number;
  /** Which of the active facets this resource actually satisfies. */
  hits: string[];
}

/** Rank resources against the active facets plus any leftover words. */
export function rank(
  resources: ResourceMetadata[],
  facets: Facet[],
  words: string[]
): Match[] {
  const scored = resources.map(resource => {
    const tags = resource.tags.map(t => t.toLowerCase());
    const title = resource.title.toLowerCase();
    const overview = (resource.overview || '').toLowerCase();
    let score = 0;
    const hits: string[] = [];

    for (const facet of facets) {
      // An exact tag is the strongest signal: it is the site's own classification.
      if (tags.includes(facet.tag.toLowerCase())) {
        score += 10;
        hits.push(facet.label);
      } else if (tags.some(t => t.includes(facet.tag.toLowerCase()))) {
        score += 4;
        hits.push(facet.label);
      } else if (title.includes(facet.tag.toLowerCase())) {
        score += 3;
        hits.push(facet.label);
      }
    }

    for (const word of words) {
      if (title.includes(word)) score += 4;
      else if (tags.some(t => t.includes(word))) score += 2;
      else if (overview.includes(word)) score += 1;
    }

    // Prefer resources matching more of what was asked, not just one thing hard.
    if (facets.length > 1) {
      score += (hits.length / facets.length) * 6;
    }

    return { resource, score, hits: [...new Set(hits)] };
  });

  return scored
    .filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score || a.resource.title.localeCompare(b.resource.title))
    .slice(0, 5);
}

