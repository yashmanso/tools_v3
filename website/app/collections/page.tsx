import { getResourcesByCategory, getAllResources } from '../lib/markdown';
import { SearchFilter } from '../components/SearchFilter';

export default function CollectionsPage() {
  const collections = getResourcesByCategory('collections');
  const allResources = getAllResources();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Collections, Compendia & Kits</h1>
        <p className="text-gray-600 dark:text-gray-400">
          An evolving list of collections, compendia or kits of tools related to sustainable
          entrepreneurship and innovation.
        </p>
      </div>

      <SearchFilter resources={collections} allResources={allResources} />
    </div>
  );
}
