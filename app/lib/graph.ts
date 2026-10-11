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
  const idf = buildTagIdf(resourceList.map(([, n]) => n));

  const candidates: GraphEdge[] = [];
  for (let i = 0; i < resourceList.length; i++) {
    for (let j = i + 1; j < resourceList.length; j++) {
      const [id1, node1] = resourceList[i];
      const [id2, node2] = resourceList[j];

      const edge = calculateRelationship(node1, node2, id1, id2, idf);

      if (edge && edge.weight > 0) {
        candidates.push(edge);
      }
    }
  }

  return { nodes, edges: pruneToStrongest(candidates, MAX_EDGES_PER_NODE) };
}

/**
 * How many of a node's relationships to keep.
 *
 * Tools carry 36 tags each out of 127, so almost every pair shares something
 * and scoring alone leaves a near-complete graph: 723 edges over 64 nodes,
 * which draws as a hairball. Keeping each node's strongest few relationships
 * bounds the density without hiding any node entirely.
 */
const MAX_EDGES_PER_NODE = 6;

/**
 * Shared tag weight at which a relationship is counted at half strength.
 * Below it, a pair has too little in common for similarity alone to be
 * trusted; above it, the normalised score carries most of the result.
 */
const EVIDENCE_HALF_WEIGHT = 6;

/**
 * Rarity weight for every tag in the corpus.
 *
 * A tag carried by nearly everything says nothing about a pair: #team is on
 * all 28 tools, #systems-thinking on 27. Weighting by inverse document
 * frequency makes those contribute almost nothing, while a tag on two or
 * three resources counts heavily. This is what separates clusters that mean
 * something from clusters that are an artifact of thorough tagging.
 */
function buildTagIdf(allNodes: GraphNode[]): Map<string, number> {
  const total = allNodes.length || 1;
  const docFreq = new Map<string, number>();

  for (const node of allNodes) {
    for (const tag of new Set(node.tags)) {
      docFreq.set(tag, (docFreq.get(tag) ?? 0) + 1);
    }
  }

  const idf = new Map<string, number>();
  for (const [tag, freq] of docFreq) {
    // log(total / freq): 0 when a tag is on everything, growing as it gets rarer.
    idf.set(tag, Math.log(total / freq));
  }
  return idf;
}

/**
 * Keep each node's strongest relationships, and the union of those keeps.
 *
 * An edge survives if either end ranks it among its best, so a niche resource
 * keeps its lifeline to the rest of the graph even when the node at the other
 * end has stronger options.
 */
function pruneToStrongest(candidates: GraphEdge[], perNode: number): GraphEdge[] {
  const byNode = new Map<string, GraphEdge[]>();
  for (const edge of candidates) {
    for (const id of [edge.source, edge.target]) {
      const list = byNode.get(id) ?? [];
      list.push(edge);
      byNode.set(id, list);
    }
  }

  const kept = new Set<GraphEdge>();
  for (const list of byNode.values()) {
    list.sort((a, b) => b.weight - a.weight);
    for (const edge of list.slice(0, perNode)) kept.add(edge);
  }

  return candidates.filter(edge => kept.has(edge));
}

/**
 * Calculate the relationship strength between two pages
 */
function calculateRelationship(
  node1: GraphNode,
  node2: GraphNode,
  id1: string,
  id2: string,
  idf: Map<string, number>
): GraphEdge | null {
  const reasons: string[] = [];
  let weight = 0;

  // 1. Shared tags, each worth what it is rare.
  //    Counting them flat made a shared #team (on every tool) worth as much as
  //    a shared #biomimicry, which is how everything ended up connected to
  //    everything.
  const sharedTags = node1.tags.filter((tag) => node2.tags.includes(tag));
  if (sharedTags.length > 0) {
    const ranked = sharedTags
      .map((tag) => ({ tag, score: idf.get(tag) ?? 0 }))
      .sort((a, b) => b.score - a.score);

    // Normalise by each page's own tag weight, so similarity is measured
    // rather than thoroughness. Future-Fit Business Benchmark carries 55 tags
    // against 26 for the leanest tool, and on a raw sum it outscored
    // everything simply for being tagged more completely.
    const shared = ranked.reduce((sum, t) => sum + t.score, 0);
    const mass = (node: GraphNode) =>
      node.tags.reduce((sum, tag) => sum + (idf.get(tag) ?? 0), 0);
    const norm = Math.sqrt(mass(node1) * mass(node2)) || 1;

    // Discount thin evidence. Articles carry about one tag each, so two of
    // them sharing #academic-articles are a perfect match by similarity alone
    // and outranked genuinely related tools. Scaling by how much shared weight
    // there is in absolute terms keeps a single common tag modest.
    const confidence = shared / (shared + EVIDENCE_HALF_WEIGHT);
    weight += (shared / norm) * confidence * 100;

    // Name the tags that actually drove the score, not the first three
    // alphabetically, so the stated reason matches the real one.
    const telling = ranked.filter((t) => t.score > 0.4).slice(0, 3);
    if (telling.length > 0) {
      reasons.push(`Shared tags: ${telling.map((t) => t.tag).join(', ')}`);
    }
  }

  // 2. Title word overlap, as a tiebreaker between similarly tagged pages.
  const titleWords1 = extractKeywords(node1.title);
  const titleWords2 = extractKeywords(node2.title);
  const sharedWords = titleWords1.filter((word) => titleWords2.includes(word));
  if (sharedWords.length > 0) {
    weight += sharedWords.length * 2;
    reasons.push(`Related terms: ${sharedWords.slice(0, 3).join(', ')}`);
  }

  // Same category used to add a flat point, which drew an edge between every
  // pair of articles whether or not they had anything in common. Category is
  // already visible as colour in the graph, so it no longer scores.

  if (weight <= 0 || reasons.length === 0) {
    return null;
  }

  return {
    source: id1,
    target: id2,
    weight: Math.round(weight * 100) / 100,
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
