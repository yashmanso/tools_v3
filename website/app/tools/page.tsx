import { getResourcesByCategory } from '../lib/markdown';
import { SearchFilter } from '../components/SearchFilter';

export default function ToolsPage() {
  const tools = getResourcesByCategory('tools');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Tools, Methods & Frameworks</h1>
        <p className="text-gray-600 dark:text-gray-400">
          An evolving list of individual tools, methods, or guides related to sustainable
          entrepreneurship and innovation.
        </p>
      </div>

      <SearchFilter resources={tools} />
    </div>
  );
}
