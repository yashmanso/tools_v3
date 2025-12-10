import { notFound } from 'next/navigation';
import { getResourceBySlug, getResourcesByCategory, getAllResources } from '@/app/lib/markdown';
import { TagList } from '@/app/components/TagList';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const articles = getResourcesByCategory('articles');
  return articles.map((article) => ({
    slug: article.slug,
  }));
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const resource = await getResourceBySlug('articles', slug);

  if (!resource) {
    notFound();
  }

  const allResources = getAllResources();

  return (
    <article className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{resource.title}</h1>
        <TagList tags={resource.tags} allResources={allResources} />
      </div>

      <div
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
          prose-img:rounded-lg prose-img:shadow-md"
        dangerouslySetInnerHTML={{ __html: resource.contentHtml }}
      />
    </article>
  );
}
