import { getResourcesByCategory, getAllResources } from '../lib/markdown';
import { FilteredPageLayout } from '../components/FilteredPageLayout';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function ArticlesPage() {
  const articles = getResourcesByCategory('articles');
  const allResources = getAllResources();

  return (
    <div>
      <Breadcrumbs />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Practical academic articles & scientific reports</h1>
        <p className="text-gray-600 dark:text-gray-400">
          An evolving list of academic peer-reviewed articles that focus on tools, frameworks,
          reviews and methods in relation to sustainable entrepreneurship and innovation.
        </p>
      </div>

      <FilteredPageLayout resources={articles} allResources={allResources} />
    </div>
  );
}
