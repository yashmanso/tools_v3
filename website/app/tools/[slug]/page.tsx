import { notFound } from 'next/navigation';
import { getResourceBySlug, getResourcesByCategory, getAllResources } from '@/app/lib/markdown';
import { getRelatedPages } from '@/app/lib/graph';
import { TagList } from '@/app/components/TagList';
import { PageHeader } from '@/app/components/PageHeader';
import { RelatedPages } from '@/app/components/RelatedPages';
import { ContentWithHoverPreviews } from '@/app/components/ContentWithHoverPreviews';
import { Breadcrumbs } from '@/app/components/Breadcrumbs';
import { TrackPageView } from '@/app/components/TrackPageView';
import { ToolCompatibility } from '@/app/components/ToolCompatibility';
import { ToolPrerequisites } from '@/app/components/ToolPrerequisites';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const tools = getResourcesByCategory('tools');
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const resource = await getResourceBySlug('tools', slug);

  if (!resource) {
    notFound();
  }

  const allResources = getAllResources();
  const relatedPages = getRelatedPages('tools', slug, 5);

  return (
    <article className="max-w-4xl mx-auto">
      <TrackPageView resource={resource} />
      <Breadcrumbs currentPageTitle={resource.title} />
      <PageHeader title={resource.title} resource={resource}>
        <TagList tags={resource.tags} allResources={allResources} resourceTitle={resource.title} />
      </PageHeader>

      <ContentWithHoverPreviews
        html={resource.contentHtml}
        className="prose prose-gray dark:prose-invert max-w-none
          prose-headings:font-bold
          prose-h1:text-3xl prose-h1:mb-4
          prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-8 prose-h2:pb-2 prose-h2:border-b prose-h2:border-gray-200 dark:prose-h2:border-gray-700
          prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-6
          prose-p:mb-4 prose-p:leading-relaxed
          prose-ul:mb-4 prose-ul:ml-6
          prose-li:mb-2
          prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-strong:font-semibold
          prose-img:rounded-3xl prose-img:shadow-md"
      />

      <ToolPrerequisites tool={resource} allResources={allResources} />

      <ToolCompatibility currentTool={resource} allResources={allResources} />

      <RelatedPages pages={relatedPages} currentCategory="tools" />
    </article>
  );
}
