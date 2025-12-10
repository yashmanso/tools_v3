import Link from 'next/link';
import { getAllResources } from './lib/markdown';
import { PanelLink } from './components/PanelLink';

export default function HomePage() {
  const allResources = getAllResources();
  const toolsCount = allResources.filter((r) => r.category === 'tools').length;
  const collectionsCount = allResources.filter((r) => r.category === 'collections').length;
  const articlesCount = allResources.filter((r) => r.category === 'articles').length;

  const featuredTools = allResources
    .filter((r) => r.category === 'tools')
    .slice(0, 6);

  return (
    <div className="max-w-4xl mx-auto">
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Sustainability Atlas
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Tools and methods for sustainable entrepreneurship and innovation
        </p>
        <p className="text-lg leading-relaxed max-w-3xl mx-auto">
          An evolving collection of resources designed to help entrepreneurs, researchers,
          educators, and practitioners integrate sustainability into their work.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-6 mb-16">
        <Link
          href="/tools"
          className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors hover:no-underline group"
        >
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {toolsCount}
          </div>
          <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            Tools & Methods
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-justify">
            Individual tools, methods, frameworks, and guides for sustainable innovation
          </p>
        </Link>

        <Link
          href="/collections"
          className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors hover:no-underline group"
        >
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {collectionsCount}
          </div>
          <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            Collections & Kits
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-justify">
            Curated collections, compendia, and toolkits for comprehensive learning
          </p>
        </Link>

        <Link
          href="/articles"
          className="p-6 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors hover:no-underline group"
        >
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {articlesCount}
          </div>
          <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            Academic Articles
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 text-justify">
            Peer-reviewed research on sustainable entrepreneurship and innovation
          </p>
        </Link>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Featured Tools</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {featuredTools.map((tool) => (
            <PanelLink
              key={tool.slug}
              href={`/${tool.category}/${tool.slug}`}
              className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-colors hover:no-underline"
            >
              <h3 className="font-semibold mb-2">{tool.title}</h3>
              <div className="mt-2 flex flex-wrap gap-1">
                {tool.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </PanelLink>
          ))}
        </div>
      </section>

      <section className="text-center py-8 border-t border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-4">Start Exploring</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Browse our comprehensive collection of resources to find the right tools for your sustainable innovation journey.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/tools"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors hover:no-underline"
          >
            Browse Tools
          </Link>
          <Link
            href="/collections"
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors hover:no-underline"
          >
            View Collections
          </Link>
        </div>
      </section>
    </div>
  );
}
