import { getResourcesByCategory, getAllResources } from '../lib/markdown';
import { FilteredPageLayout } from '../components/FilteredPageLayout';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function ToolsPage() {
  const tools = getResourcesByCategory('tools');
  const allResources = getAllResources();

  return (
    <div>
      <Breadcrumbs />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Tools, methods & frameworks</h1>
        <p className="text-gray-600 dark:text-gray-400">
          An evolving list of individual tools, methods, or guides related to sustainable
          entrepreneurship and innovation.
        </p>
      </div>

      <FilteredPageLayout resources={tools} allResources={allResources} />
    </div>
  );
}
