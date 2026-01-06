import Link from 'next/link';
import { getAllResources } from './lib/markdown';
import { ExploreSection } from './components/ExploreSection';

export default function HomePage() {
  const allResources = getAllResources();
  const toolsCount = allResources.filter((r) => r.category === 'tools').length;
  const collectionsCount = allResources.filter((r) => r.category === 'collections').length;
  const articlesCount = allResources.filter((r) => r.category === 'articles').length;

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

      <section className="mb-16 max-w-3xl mx-auto">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4 text-center">About This Collection</h2>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
              This collection brings together practical tools, methods, and frameworks for integrating 
              sustainability into entrepreneurial and innovation work. The resources here have been gathered 
              from various sources—academic research, practitioner guides, and established frameworks—to 
              provide a starting point for those working on sustainable innovation challenges.
            </p>

            <p>
              Whether you're mapping out a new concept, assessing impact, developing a strategy, or 
              looking for ways to align your work with sustainability goals, you'll find resources that 
              can support different stages of your process. The collection includes individual tools 
              for specific tasks, comprehensive toolkits that cover broader processes, and academic 
              articles that provide deeper context and validation.
            </p>

            <p>
              These resources may be useful if you're working on product or service design, developing 
              business models, planning organizational change, conducting research, or teaching others 
              about sustainable innovation. They span different levels of complexity—from simple canvases 
              and checklists to more involved frameworks requiring facilitation or deeper engagement.
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400 italic border-l-4 border-gray-300 dark:border-gray-600 pl-4">
              This is a living collection that continues to evolve. Resources are organized by type 
              and tagged across multiple dimensions to help you find what's relevant to your context 
              and needs.
            </p>
          </div>
        </div>
      </section>

      <ExploreSection allResources={allResources} />
    </div>
  );
}
