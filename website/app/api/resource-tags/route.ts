import { NextResponse } from 'next/server';
import { getAllResources } from '@/app/lib/markdown';

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
    const allResources = getAllResources();
    const resource = allResources.find(
      r => r.category === category && r.slug === slug
    );

    if (!resource) {
      return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
    }

    return NextResponse.json({
      title: resource.title,
      tags: resource.tags,
      category: resource.category,
      slug: resource.slug
    });
  } catch (error) {
    console.error('Error fetching resource tags:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
