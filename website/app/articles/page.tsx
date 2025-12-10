import { getResourcesByCategory } from '../lib/markdown';
import { SearchFilter } from '../components/SearchFilter';

export default function ArticlesPage() {
  const articles = getResourcesByCategory('articles');

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Practical Academic Articles & Scientific Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">
          An evolving list of academic peer-reviewed articles that focus on tools, frameworks,
          reviews and methods in relation to sustainable entrepreneurship and innovation.
        </p>
      </div>

      <SearchFilter resources={articles} />
    </div>
  );
}
