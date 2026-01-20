import OpenAI from 'openai';

const TAG_GLOSSARY = `
## Resource Type
- #academic-articles, #book, #case-study, #method, #tool, #software-tool, #toolkit, #template, #framework, #online-course, #canvas, #whitepaper

## Objective
- #map, #assess, #report, #align

## Target Audience
- #entrepreneurs, #researchers, #students, #policy-makers, #investors, #educators, #practitioners, #nonprofits, #startups, #SMEs, #corporations, #general-public

## Sustainability Focus
- #environmental-sustainability, #social-sustainability, #economic-sustainability, #environmental-impact, #social-impact, #economic-impact, #circular-economy, #governance, #CSR, #SDGs

## Innovation Type
- #product-innovation, #process-innovation, #business-model-innovation, #social-innovation, #technological-innovation, #open-innovation

## Entrepreneurship Stage
- #ideation, #design, #development, #implementation, #startup, #growth, #scale-up, #maturity

## Scope of Relevance
- #global, #regional, #national, #local, #urban, #rural

## Methodological Approach
- #qualitative-research, #quantitative-research, #mixed-methods, #experimental-design, #theoretical-frameworks

## Skill Development
- #leadership-and-management, #creativity-and-design, #financial-literacy, #marketing-and-communication, #technical-skills, #networking-and-collaboration, #systems-thinking, #holistic-thinking, #environmental-awareness, #innovative-thinking, #adaptability-and-resilience, #business-and-financial-skills, #collaboration-and-networking, #data-analysis-and-metrics, #communication-and-storytelling, #regulatory-and-legal-understanding

## Source and Credibility
- #peer-reviewed-publications, #government-sources, #reputable-industry-sources, #academic-institutions, #recognized-experts, #practice, #research

## Prerequisites and Requirements
- #none, #beginner-level, #intermediate-level, #advanced-level, #expert-level, #specific-educational-background, #required-equipment-or-aids, #facilitators

## Collaboration Level
- #individual, #team, #community, #cross-sector-partnerships, #public-private-partnership, #community-engagement
`;

export interface ParsedFile {
  filename: string;
  content: string;
  type: string;
}

export interface SearchResult {
  content: string;
  sources?: string[];
}

/**
 * Generate tool content using OpenAI
 */
export async function generateToolContent(
  toolName: string,
  parsedFiles: ParsedFile[],
  searchResults: SearchResult,
  openaiApiKey: string,
  resourceType: 'tools' | 'collections' | 'articles' = 'tools'
): Promise<{
  overview: string;
  dimensions?: Record<string, { description: string; tags: string[] }>;
  resources: string[];
  citation?: string;
  url?: string;
}> {
  const openai = new OpenAI({
    apiKey: openaiApiKey,
  });
  const filesContent = parsedFiles
    .map(file => `File: ${file.filename}\n${file.content}\n`)
    .join('\n---\n\n');

  const searchContent = searchResults.content || 'No web search results available.';
  const searchSources = searchResults.sources?.length 
    ? `\nSources: ${searchResults.sources.join(', ')}`
    : '';

  let prompt = '';
  let expectedJsonStructure = '';

  if (resourceType === 'tools') {
    prompt = `You are creating a tool page for a sustainability tools database.

Tool Name: ${toolName}

Uploaded Files Content:
${filesContent || 'No files uploaded.'}

Web Search Results:
${searchContent}${searchSources}

Create a comprehensive tool page with:

1. Overview section (2-3 paragraphs describing what the tool is, its purpose, and why it matters for sustainability)

2. Dimensions section with all 12 dimensions. For each dimension, provide:
   - A description (1-2 sentences)
   - Relevant tags from the tag glossary below (select 1-5 most appropriate tags)

The 12 dimensions are:
- Resource type: What kind of resource is this tool?
- Objective: What does this tool help accomplish?
- Target audience: Who is this tool for?
- Sustainability focus: Environmental, social, economic, etc.
- Innovation type: Product, process, business model, etc.
- Entrepreneurship stage: Ideation, design, development, etc.
- Scope of relevance: Local, regional, global, etc.
- Methodological approach: Framework, workshop, toolkit, etc.
- Skill development: What skills does it build?
- Source and credibility: Where does it come from and why is it credible?
- Prerequisites and requirements: Knowledge or resources needed to use it.
- Collaboration level: Individual, team, cross-team, etc.

3. Resources section: List the uploaded files (use format: ![[filename]] for each file)

Tag Glossary (use only these tags, format as #tag-name):
${TAG_GLOSSARY}

IMPORTANT FORMATTING RULES:
- Use markdown format
- For dimensions, use this exact format:
  **Dimension Name:**
  Description text here.
  - Tags: #tag1 #tag2 #tag3

- For resources, use: ![[filename]] format for each file
- Be specific and accurate based on the information provided
- If information is not available, make reasonable inferences but note uncertainty
- Keep descriptions concise (1-2 sentences per dimension)
- Select tags that best match the tool's characteristics`;

    expectedJsonStructure = `{
  "overview": "2-3 paragraph overview text",
  "dimensions": {
    "resourceType": { "description": "...", "tags": ["tag1", "tag2"] },
    "objective": { "description": "...", "tags": ["tag1"] },
    "targetAudience": { "description": "...", "tags": ["tag1", "tag2"] },
    "sustainabilityFocus": { "description": "...", "tags": ["tag1"] },
    "innovationType": { "description": "...", "tags": ["tag1"] },
    "entrepreneurshipStage": { "description": "...", "tags": ["tag1", "tag2"] },
    "scope": { "description": "...", "tags": ["tag1"] },
    "methodology": { "description": "...", "tags": ["tag1"] },
    "skillDevelopment": { "description": "...", "tags": ["tag1", "tag2"] },
    "sourceCredibility": { "description": "...", "tags": ["tag1"] },
    "prerequisites": { "description": "...", "tags": ["tag1"] },
    "collaborationLevel": { "description": "...", "tags": ["tag1", "tag2"] }
  },
  "resources": ["filename1.pdf", "filename2.docx"]
}`;
  } else if (resourceType === 'collections') {
    prompt = `You are creating a collection/compendium/toolkit page for a sustainability tools database.

Collection Name: ${toolName}

Uploaded Files Content:
${filesContent || 'No files uploaded.'}

Web Search Results:
${searchContent}${searchSources}

Create a comprehensive collection page with:

1. Overview/Description (2-3 paragraphs describing what the collection is, what tools/resources it contains, its purpose, and how it relates to sustainability)

2. Resources section: List the uploaded files (use format: ![[filename]] for each file)

IMPORTANT FORMATTING RULES:
- Be specific and accurate based on the information provided
- Describe the collection's contents, organization, and how to use it
- Keep the description concise but informative`;

    expectedJsonStructure = `{
  "overview": "2-3 paragraph description text",
  "resources": ["filename1.pdf", "filename2.docx"]
}`;
  } else if (resourceType === 'articles') {
    prompt = `You are creating an academic article/scientific report page for a sustainability tools database.

Article Title: ${toolName}

Uploaded Files Content:
${filesContent || 'No files uploaded.'}

Web Search Results:
${searchContent}${searchSources}

Create a comprehensive article page with:

1. Abstract (2-3 paragraphs summarizing the article's purpose, methodology, key findings, and contributions to sustainability)

2. Citation (in standard academic format: Author(s). (Year). Title. Journal/Publisher, Volume(Issue), Pages.)

3. URL (if available from search results, the link to access the article)

4. Resources section: List the uploaded files (use format: ![[filename]] for each file)

IMPORTANT FORMATTING RULES:
- The abstract should be academic in tone
- Extract citation information from search results or files
- Include URL if available
- Be specific and accurate based on the information provided`;

    expectedJsonStructure = `{
  "overview": "Abstract text (2-3 paragraphs)",
  "citation": "Author(s). (Year). Title. Journal, Volume(Issue), Pages.",
  "url": "https://example.com/article-url",
  "resources": ["filename1.pdf", "filename2.docx"]
}`;
  }

  prompt += `\n\nReturn your response as a JSON object with this structure:\n${expectedJsonStructure}\n\nReturn ONLY valid JSON, no markdown formatting or additional text.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating structured tool documentation for sustainability tools databases. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Extract JSON from response (handle cases where there might be markdown code blocks)
    let jsonContent = content.trim();
    if (jsonContent.startsWith('```json')) {
      jsonContent = jsonContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(jsonContent);

    // Validate and normalize the response based on resource type
    if (resourceType === 'tools') {
      const dimensions: Record<string, { description: string; tags: string[] }> = {};
      const dimensionKeys = [
        'resourceType',
        'objective',
        'targetAudience',
        'sustainabilityFocus',
        'innovationType',
        'entrepreneurshipStage',
        'scope',
        'methodology',
        'skillDevelopment',
        'sourceCredibility',
        'prerequisites',
        'collaborationLevel',
      ];

      for (const key of dimensionKeys) {
        const dim = parsed.dimensions?.[key];
        if (dim) {
          dimensions[key] = {
            description: dim.description || '',
            tags: Array.isArray(dim.tags) ? dim.tags : [],
          };
        } else {
          dimensions[key] = { description: '', tags: [] };
        }
      }

      return {
        overview: parsed.overview || '',
        dimensions,
        resources: Array.isArray(parsed.resources) 
          ? parsed.resources 
          : parsedFiles.map((f: ParsedFile) => f.filename),
      };
    } else if (resourceType === 'collections') {
      return {
        overview: parsed.overview || '',
        resources: Array.isArray(parsed.resources) 
          ? parsed.resources 
          : parsedFiles.map((f: ParsedFile) => f.filename),
      };
    } else {
      // articles
      return {
        overview: parsed.overview || '',
        citation: parsed.citation || '',
        url: parsed.url || '',
        resources: Array.isArray(parsed.resources) 
          ? parsed.resources 
          : parsedFiles.map((f: ParsedFile) => f.filename),
      };
    }
  } catch (error) {
    console.error('Error generating tool content:', error);
    throw new Error(
      `Failed to generate tool content: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Search using Perplexity API
 */
export async function searchPerplexity(query: string, perplexityApiKey: string): Promise<SearchResult> {
  if (!perplexityApiKey) {
    throw new Error('Perplexity API key is required');
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${perplexityApiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that provides comprehensive information about sustainability tools, methods, and frameworks. Provide detailed, accurate information with sources.',
          },
          {
            role: 'user',
            content: `Provide comprehensive information about: ${query}. Include details about what it is, its purpose, target audience, methodology, and how it relates to sustainability.`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    return {
      content,
      sources: citations,
    };
  } catch (error) {
    console.error('Error searching Perplexity:', error);
    // Return empty result instead of throwing to allow continuation
    return {
      content: `[Search unavailable: ${error instanceof Error ? error.message : 'Unknown error'}]`,
      sources: [],
    };
  }
}
