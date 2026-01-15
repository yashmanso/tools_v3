import Link from 'next/link';
import { getAllResources } from './lib/markdown';
import { buildPageGraph } from './lib/graph';
import { ExploreSection } from './components/ExploreSection';
import { TypewriterTitle } from './components/TypewriterTitle';
import { ScrollAnimation } from './components/ScrollAnimation';
import { StaggeredText } from './components/StaggeredText';
import { MostViewedTools } from './components/MostViewedTools';

export default function HomePage() {
  const allResources = getAllResources();
  
  // Build graph on server side
  const graph = buildPageGraph();
  const graphData = {
    nodes: Array.from(graph.nodes.entries()).map(([id, node]) => ({
      id,
      node,
    })),
    edges: graph.edges,
  };

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-primary)]">
      <section className="text-center mb-16">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 tracking-tight leading-[1.1]">
          <TypewriterTitle text="Sustainability Atlas" speed={100} repeat={true} />
        </h1>
        <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-400 mb-8 text-center font-medium tracking-tight">
          Tools and methods for sustainable entrepreneurship and innovation
        </p>
        <p className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto text-left text-gray-700 dark:text-gray-300">
          An evolving collection of resources designed to help entrepreneurs, researchers,
          educators, and practitioners integrate sustainability into their work.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-6 mb-16">
        <ScrollAnimation direction="slide-up" delay={0}>
          <div>
            <Link
              href="/tools"
              className="block p-6 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:no-underline bg-[var(--bg-secondary)] hover-lift"
            >
              <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
                Tools & methods
              </h2>
              <p className="text-sm text-[var(--text-secondary)] text-left leading-relaxed">
                Individual tools, methods, frameworks, and guides for sustainable innovation
              </p>
            </Link>
          </div>
        </ScrollAnimation>

        <ScrollAnimation direction="slide-up" delay={100}>
          <div>
            <Link
              href="/collections"
              className="block p-6 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:no-underline bg-[var(--bg-secondary)] hover-lift"
            >
              <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
                Collections & kits
              </h2>
              <p className="text-sm text-[var(--text-secondary)] text-left leading-relaxed">
                Curated collections, compendia, and toolkits for comprehensive learning
              </p>
            </Link>
          </div>
        </ScrollAnimation>

        <ScrollAnimation direction="slide-up" delay={200}>
          <div>
            <Link
              href="/articles"
              className="block p-6 rounded-3xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:no-underline bg-[var(--bg-secondary)] hover-lift"
            >
              <h2 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">
                Academic articles
              </h2>
              <p className="text-sm text-[var(--text-secondary)] text-left leading-relaxed">
                Peer-reviewed research on sustainable entrepreneurship and innovation
              </p>
            </Link>
          </div>
        </ScrollAnimation>
      </section>

      <section className="mb-16 max-w-3xl mx-auto">
        <ScrollAnimation direction="fade" delay={0}>
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <h2 className="text-2xl font-bold mb-4 text-center">
              <StaggeredText text="About this collection" delay={80} triggerOnScroll={true} />
            </h2>
          
          <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed">
            <ScrollAnimation direction="fade" delay={200}>
              <p>
                This collection brings together practical tools, methods, and frameworks for integrating 
                sustainability into entrepreneurial and innovation work. The resources here have been gathered 
                from various sources—academic research, practitioner guides, and established frameworks—to 
                provide a starting point for those working on sustainable innovation challenges.
              </p>
            </ScrollAnimation>

            <ScrollAnimation direction="fade" delay={400}>
              <p>
                Whether you're mapping out a new concept, assessing impact, developing a strategy, or 
                looking for ways to align your work with sustainability goals, you'll find resources that 
                can support different stages of your process. The collection includes individual tools 
                for specific tasks, comprehensive toolkits that cover broader processes, and academic 
                articles that provide deeper context and validation.
              </p>
            </ScrollAnimation>

            <ScrollAnimation direction="fade" delay={600}>
              <p>
                These resources may be useful if you're working on product or service design, developing 
                business models, planning organizational change, conducting research, or teaching others 
                about sustainable innovation. They span different levels of complexity—from simple canvases 
                and checklists to more involved frameworks requiring facilitation or deeper engagement.
              </p>
            </ScrollAnimation>

            <ScrollAnimation direction="fade" delay={800}>
              <p className="text-sm text-gray-600 dark:text-gray-400 italic border-l-4 border-gray-300 dark:border-gray-600 pl-4">
                This is a living collection that continues to evolve. Resources are organized by type 
                and tagged across multiple dimensions to help you find what's relevant to your context 
                and needs.
              </p>
            </ScrollAnimation>
          </div>
          </div>
        </ScrollAnimation>
      </section>

      <MostViewedTools allResources={allResources} />

      <ExploreSection allResources={allResources} graphData={graphData} />
    </div>
  );
}
