import { getResourcesByCategory, getAllResources } from '../lib/markdown';
import { FilteredPageLayout } from '../components/FilteredPageLayout';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function CollectionsPage() {
  const collections = getResourcesByCategory('collections');
  const allResources = getAllResources();

  return (
    <div>
      <Breadcrumbs />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Collections, compendia & kits</h1>
        <p className="text-gray-600 dark:text-gray-400">
          An evolving list of collections, compendia or kits of tools related to sustainable
          entrepreneurship and innovation.
        </p>
      </div>

      <FilteredPageLayout resources={collections} allResources={allResources} />
    </div>
  );
}
