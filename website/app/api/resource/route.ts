import { NextResponse } from 'next/server';
import { getResourceBySlug, getAllResources } from '@/app/lib/markdown';
import { getRelatedPages } from '@/app/lib/graph';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json({ error: 'Path is required' }, { status: 400 });
  }

  // Parse path like /tools/circular-canvas or tools/circular-canvas
  const pathParts = path.replace(/^\//, '').split('/').filter(Boolean);
  
  if (pathParts.length < 2) {
    return NextResponse.json({ error: 'Invalid path format' }, { status: 400 });
  }

  const [category, slug] = pathParts;
  
  try {
    const resource = await getResourceBySlug(category, slug);
    
    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    const allResources = getAllResources();
    const relatedPages = getRelatedPages(category, slug, 5);

    return NextResponse.json({
      resource: {
        title: resource.title,
        slug: resource.slug,
        category: resource.category,
        tags: resource.tags,
        contentHtml: resource.contentHtml,
        overview: resource.overview,
        compatibleTools: resource.compatibleTools,
        prerequisites: resource.prerequisites,
      },
      relatedPages,
      allResources: allResources.map(r => ({
        title: r.title,
        slug: r.slug,
        category: r.category,
        tags: r.tags,
        overview: r.overview,
      }))
    });
  } catch (error) {
    console.error('Error fetching resource:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
