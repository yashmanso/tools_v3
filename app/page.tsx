import Link from 'next/link';
import { getAllResources } from './lib/markdown';
import { buildPageGraph } from './lib/graph';
import { ExploreSection } from './components/ExploreSection';
import { TypewriterTitle } from './components/TypewriterTitle';
import { ScrollAnimation } from './components/ScrollAnimation';
import { StaggeredText } from './components/StaggeredText';
import { MostViewedTools } from './components/MostViewedTools';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const allResources = getAllResources();
  const count = (category: string) =>
    allResources.filter((r) => r.category === category).length;
  
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
    <div className="bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto">
        <section className="text-center mb-16 px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 tracking-tight leading-[1.1]">
            <TypewriterTitle text="Sustainability Atlas" speed={100} repeat={true} />
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 mb-8 text-center font-medium tracking-tight">
            Tools and methods for sustainable entrepreneurship and innovation
          </p>
          <p className="text-lg md:text-xl leading-relaxed max-w-3xl mx-auto text-left text-gray-700 dark:text-gray-300">
            {count('tools')} tools, {count('collections')} collections and {count('articles')} articles for
            building sustainability into entrepreneurial and innovation work, gathered from academic
            research, practitioner guides, and established frameworks.
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
              <p className="text-sm text-[var(--text-secondary)] text-center leading-relaxed">
                Single tools you can pick up and use: canvases, frameworks, methods, and guides
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
              <p className="text-sm text-[var(--text-secondary)] text-center leading-relaxed">
                Multi-tool kits that cover a whole process rather than one task
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
              <p className="text-sm text-[var(--text-secondary)] text-center leading-relaxed">
                The peer-reviewed research behind the tools, for when you need the evidence
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
                Every tool here is described the same way: what it is for, who it suits, which stage of
                the journey it fits, and what it asks of you before you start. That shared description is
                what lets you compare tools properly, see which ones work together, and find the ones
                that match your situation rather than the ones that happen to share a keyword.
              </p>
            </ScrollAnimation>

            <ScrollAnimation direction="fade" delay={400}>
              <p>
                They range from simple canvases you can hand out in a workshop to frameworks that need
                facilitation and a few sessions. Use them when you are shaping a concept, assessing
                impact, planning a strategy, or teaching the subject to someone else.
              </p>
            </ScrollAnimation>

          </div>
          </div>
        </ScrollAnimation>
      </section>

        <MostViewedTools allResources={allResources} />
      </div>

      <ExploreSection allResources={allResources} graphData={graphData} />

      <div className="max-w-4xl mx-auto">
        {/* Leave Feedback Button */}
        <section className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700 text-center">
          <Link href="/survey">
            <Button className="px-8 py-6 text-base">
              Leave feedback
            </Button>
          </Link>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            Help us improve the toolbox by sharing your experience
          </p>
        </section>
      </div>
    </div>
  );
}
