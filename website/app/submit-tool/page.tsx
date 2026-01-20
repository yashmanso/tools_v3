import { ToolSubmissionSection } from '../components/ToolSubmissionSection';
import { Breadcrumbs } from '../components/Breadcrumbs';

export default function SubmitToolPage() {
  return (
    <div>
      <Breadcrumbs />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Submit a tool</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Share your sustainability tool, method, framework, or guide with our community. 
          Your submission will help others discover resources for sustainable innovation.
        </p>
      </div>

      <ToolSubmissionSection />
    </div>
  );
}
