import { getAllResources, ResourceMetadata } from './markdown';

export interface GraphNode {
  slug: string;
  title: string;
  category: string;
  tags: string[];
}

export interface GraphEdge {
  source: string; // slug
  target: string; // slug
  weight: number; // strength of relationship
  reasons: string[]; // why they're related
}

export interface PageGraph {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}

export interface RelatedPage {
  slug: string;
  title: string;
  category: string;
  score: number;
  reasons: string[];
}

/**
 * Builds a graph of all pages in the corpus, identifying relationships
 * based on shared tags, wiki-links, and content similarity.
 */
export function buildPageGraph(): PageGraph {
  const resources = getAllResources();
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];

  // Create nodes for all resources
  for (const resource of resources) {
    const nodeId = `${resource.category}/${resource.slug}`;
    nodes.set(nodeId, {
      slug: resource.slug,
      title: resource.title,
      category: resource.category,
      tags: resource.tags,
    });
  }

  // Build edges based on relationships
  const resourceList = Array.from(nodes.entries());

  for (let i = 0; i < resourceList.length; i++) {
    for (let j = i + 1; j < resourceList.length; j++) {
      const [id1, node1] = resourceList[i];
      const [id2, node2] = resourceList[j];

      const edge = calculateRelationship(node1, node2, id1, id2);

      if (edge && edge.weight > 0) {
        edges.push(edge);
      }
    }
  }

  return { nodes, edges };
}

/**
 * Calculate the relationship strength between two pages
 */
function calculateRelationship(
  node1: GraphNode,
  node2: GraphNode,
  id1: string,
  id2: string
): GraphEdge | null {
  const reasons: string[] = [];
  let weight = 0;

  // 1. Shared tags (strongest signal)
  const sharedTags = node1.tags.filter((tag) => node2.tags.includes(tag));
  if (sharedTags.length > 0) {
    // Weight increases with more shared tags
    weight += sharedTags.length * 2;
    reasons.push(`Shared tags: ${sharedTags.slice(0, 3).join(', ')}${sharedTags.length > 3 ? '...' : ''}`);
  }

  // 2. Same category (moderate signal)
  if (node1.category === node2.category) {
    weight += 1;
    reasons.push(`Same category: ${node1.category}`);
  }

  // 3. Title word overlap (weak signal)
  const titleWords1 = extractKeywords(node1.title);
  const titleWords2 = extractKeywords(node2.title);
  const sharedWords = titleWords1.filter((word) => titleWords2.includes(word));
  if (sharedWords.length > 0) {
    weight += sharedWords.length * 0.5;
    reasons.push(`Related terms: ${sharedWords.slice(0, 3).join(', ')}`);
  }

  // 4. Tag category overlap (e.g., both have sustainability-related tags)
  const tagCategories1 = getTagCategories(node1.tags);
  const tagCategories2 = getTagCategories(node2.tags);
  const sharedCategories = tagCategories1.filter((cat) => tagCategories2.includes(cat));
  if (sharedCategories.length > 0 && sharedTags.length === 0) {
    // Only add if no direct tag overlap
    weight += sharedCategories.length * 0.3;
  }

  if (weight === 0) {
    return null;
  }

  return {
    source: id1,
    target: id2,
    weight,
    reasons,
  };
}

/**
 * Extract meaningful keywords from a title
 */
function extractKeywords(title: string): string[] {
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'that', 'which', 'who', 'whom', 'this', 'these', 'those', 'it',
    'its', 'their', 'our', 'your', 'my', 'his', 'her', 'tool', 'tools',
    'framework', 'method', 'canvas', 'toolkit', 'guide', 'assessment',
  ]);

  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

/**
 * Get broad categories from tags
 */
function getTagCategories(tags: string[]): string[] {
  const categories: string[] = [];

  const sustainabilityTags = ['environmental-sustainability', 'social-sustainability', 'economic-sustainability', 'SDGs', 'circular-economy'];
  const innovationTags = ['product-innovation', 'process-innovation', 'business-model-innovation', 'social-innovation'];
  const stageTags = ['ideation', 'design', 'development', 'implementation', 'startup', 'growth'];
  const audienceTags = ['entrepreneurs', 'researchers', 'students', 'practitioners'];

  if (tags.some((t) => sustainabilityTags.includes(t))) {
    categories.push('sustainability');
  }
  if (tags.some((t) => innovationTags.includes(t))) {
    categories.push('innovation');
  }
  if (tags.some((t) => stageTags.includes(t))) {
    categories.push('entrepreneurship-stage');
  }
  if (tags.some((t) => audienceTags.includes(t))) {
    categories.push('audience');
  }

  return categories;
}

/**
 * Get related pages for a specific page
 */
export function getRelatedPages(
  category: string,
  slug: string,
  limit: number = 5
): RelatedPage[] {
  const graph = buildPageGraph();
  const pageId = `${category}/${slug}`;

  // Find all edges connected to this page
  const relatedEdges = graph.edges.filter(
    (edge) => edge.source === pageId || edge.target === pageId
  );

  // Get the related page IDs and scores
  const relatedScores = new Map<string, { score: number; reasons: string[] }>();

  for (const edge of relatedEdges) {
    const relatedId = edge.source === pageId ? edge.target : edge.source;
    const existing = relatedScores.get(relatedId);

    if (existing) {
      existing.score += edge.weight;
      existing.reasons.push(...edge.reasons);
    } else {
      relatedScores.set(relatedId, {
        score: edge.weight,
        reasons: [...edge.reasons],
      });
    }
  }

  // Convert to array and sort by score
  const relatedPages: RelatedPage[] = [];

  for (const [id, { score, reasons }] of relatedScores) {
    const node = graph.nodes.get(id);
    if (node) {
      relatedPages.push({
        slug: node.slug,
        title: node.title,
        category: node.category,
        score,
        reasons: [...new Set(reasons)], // dedupe reasons
      });
    }
  }

  // Sort by score (highest first) and limit
  return relatedPages
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Get all pages that share a specific tag
 */
export function getPagesByTag(tag: string): GraphNode[] {
  const resources = getAllResources();

  return resources
    .filter((resource) => resource.tags.includes(tag))
    .map((resource) => ({
      slug: resource.slug,
      title: resource.title,
      category: resource.category,
      tags: resource.tags,
    }));
}

/**
 * Get statistics about the page graph
 */
export function getGraphStats(): {
  totalPages: number;
  totalEdges: number;
  avgConnections: number;
  mostConnected: { title: string; connections: number }[];
} {
  const graph = buildPageGraph();

  const connectionCounts = new Map<string, number>();

  for (const edge of graph.edges) {
    connectionCounts.set(edge.source, (connectionCounts.get(edge.source) || 0) + 1);
    connectionCounts.set(edge.target, (connectionCounts.get(edge.target) || 0) + 1);
  }

  const connections = Array.from(connectionCounts.entries())
    .map(([id, count]) => ({
      id,
      title: graph.nodes.get(id)?.title || id,
      connections: count,
    }))
    .sort((a, b) => b.connections - a.connections);

  return {
    totalPages: graph.nodes.size,
    totalEdges: graph.edges.length,
    avgConnections: graph.nodes.size > 0
      ? graph.edges.length * 2 / graph.nodes.size
      : 0,
    mostConnected: connections.slice(0, 5).map(({ title, connections }) => ({
      title,
      connections,
    })),
  };
}
