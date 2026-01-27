'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { useRouter } from 'next/navigation';

type ProgressStep = 'idle' | 'parsing' | 'searching' | 'generating' | 'saving' | 'complete';
type ResourceType = 'tools' | 'collections' | 'articles';

const CONTACT_EMAIL = 'yashar.mansoori@chalmers.se';

export default function AutoCreateToolPage() {
  const router = useRouter();
  const [resourceType, setResourceType] = useState<ResourceType>('tools');
  const [toolName, setToolName] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [openaiKey, setOpenaiKey] = useState('');
  const [perplexityKey, setPerplexityKey] = useState('');
  const [progress, setProgress] = useState<ProgressStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [showEmailFallback, setShowEmailFallback] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 10) {
      setError('Maximum 10 files allowed');
      return;
    }
    setFiles(selectedFiles);
    setError(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendEmail = () => {
    const resourceTypeLabel = resourceType === 'tools' ? 'Tool' : resourceType === 'collections' ? 'Collection' : 'Article';
    const subject = encodeURIComponent(`New ${resourceTypeLabel} Submission: ${toolName || '[Tool Name]'}`);
    const filesList = files.length > 0 
      ? files.map(f => `- ${f.name}`).join('\n')
      : '(No files attached - please attach files to this email)';
    
    const body = encodeURIComponent(
`Hello,

I would like to submit a new ${resourceTypeLabel.toLowerCase()} to the Sustainability Atlas.

Resource Type: ${resourceTypeLabel}
Name: ${toolName || '[Please provide the name]'}

Files to be included:
${filesList}

Please note: I was unable to use the automatic generation feature as I don't have the required API keys. Could you please help me create this resource page?

Thank you!`
    );

    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    
    // Try to open mail client
    window.location.href = mailtoUrl;
    
    // Show fallback after a short delay (in case mailto doesn't work)
    setTimeout(() => {
      setShowEmailFallback(true);
    }, 500);
  };

  const handleGenerate = async () => {
    if (!toolName.trim()) {
      setError('Tool name is required');
      return;
    }

    if (!openaiKey.trim()) {
      setError('OpenAI API key is required');
      return;
    }

    if (!perplexityKey.trim()) {
      setError('Perplexity API key is required');
      return;
    }

    setError(null);
    setProgress('parsing');

    try {
      const formData = new FormData();
      formData.append('resourceType', resourceType);
      formData.append('toolName', toolName);
      formData.append('openaiKey', openaiKey);
      formData.append('perplexityKey', perplexityKey);
      files.forEach((file) => {
        formData.append('files', file);
      });

      // Update progress states
      const progressUpdates: ProgressStep[] = ['parsing', 'searching', 'generating', 'saving'];
      let progressIndex = 0;

      const progressInterval = setInterval(() => {
        if (progressIndex < progressUpdates.length - 1) {
          progressIndex++;
          setProgress(progressUpdates[progressIndex]);
        }
      }, 2000);

      const response = await fetch('/api/auto-create-tool', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress('complete');

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data?.error || 'Failed to generate tool';
        
        // Provide more helpful error messages
        if (errorMessage.includes('API_KEY') || errorMessage.includes('api key')) {
          throw new Error('API keys are not configured. Please set OPENAI_API_KEY and PERPLEXITY_API_KEY in environment variables.');
        }
        
        throw new Error(errorMessage);
      }

      // Resource has been created successfully, redirect to the resource page
      // Use the slug and resourceType returned from the API (which matches the actual filename)
      const slug = data.slug || toolName
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
      
      const finalResourceType = data.resourceType || resourceType;
      
      setProgress('complete');
      
      // Small delay to ensure file is written and Next.js can find it
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to the resource page where user can view the generated content
      // They can edit the markdown file directly if needed
      router.push(`/${finalResourceType}/${slug}`);
    } catch (error) {
      setProgress('idle');
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate tool';
      setError(errorMessage);
      
      // Log error for debugging
      console.error('Auto-create tool error:', error);
    }
  };


  return (
    <div>
      <Breadcrumbs />
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-3">Auto create resource</h1>
        <div className="space-y-3 text-gray-600 dark:text-gray-400">
          <p>
            Enter a tool name and upload related files. The system will automatically search the web, analyze your files, 
            and generate a formatted tool page matching the style of existing tools in the database.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
            <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">What happens when you click "Generate Tool Page":</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                <strong>File Parsing:</strong> The system extracts text content from your uploaded files (PDF, DOCX, TXT, images). 
                Each file is processed to extract readable text that will be used to understand the tool.
              </li>
              <li>
                <strong>Web Search:</strong> Using Perplexity AI, the system searches the web for comprehensive information about your tool. 
                It looks for details about what the tool is, its purpose, methodology, target audience, and how it relates to sustainability.
              </li>
              <li>
                <strong>Content Generation:</strong> OpenAI GPT-4 analyzes the parsed file content and web search results to generate:
                <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                  <li>A comprehensive <strong>Overview</strong> section (2-3 paragraphs) describing the tool</li>
                  <li>All 12 <strong>Dimensions</strong> with descriptions and relevant tags:
                    <ul className="list-disc list-inside ml-4 mt-1 text-xs">
                      <li>Resource type, Objective, Target audience, Sustainability focus</li>
                      <li>Innovation type, Entrepreneurship stage, Scope of relevance</li>
                      <li>Methodological approach, Skill development, Source and credibility</li>
                      <li>Prerequisites and requirements, Collaboration level</li>
                    </ul>
                  </li>
                  <li>A <strong>Resources</strong> section listing your uploaded files</li>
                </ul>
              </li>
              <li>
                <strong>File Saving:</strong> Your uploaded files are saved to the attachments directory and linked in the tool page.
              </li>
              <li>
                <strong>Tool Creation:</strong> A markdown file is created in the tools directory with the generated content, 
                formatted exactly like existing tools in the database.
              </li>
              <li>
                <strong>Preview & Edit:</strong> You can review the generated content, edit any sections, and then save the final tool page.
              </li>
            </ol>
            <p className="text-xs mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
              <strong>Note:</strong> The entire process typically takes 30-60 seconds depending on the number of files and complexity. 
              You'll see progress indicators for each step.
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-gray-200 dark:border-gray-700 bg-[var(--bg-secondary)] p-6 space-y-6">
        <>
            <div className="space-y-4">
              {/* Resource Type Selector */}
              <div className="space-y-2">
                <Label>Resource type</Label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setResourceType('tools')}
                    disabled={progress !== 'idle'}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      resourceType === 'tools'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    } ${progress !== 'idle' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="font-semibold">Tools</div>
                    <div className="text-xs mt-1">Methods, frameworks, guides</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResourceType('collections')}
                    disabled={progress !== 'idle'}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      resourceType === 'collections'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    } ${progress !== 'idle' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="font-semibold">Collections</div>
                    <div className="text-xs mt-1">Compendia, kits, toolboxes</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResourceType('articles')}
                    disabled={progress !== 'idle'}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      resourceType === 'articles'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    } ${progress !== 'idle' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="font-semibold">Articles</div>
                    <div className="text-xs mt-1">Academic papers, reports</div>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tool-name">
                  {resourceType === 'tools' ? 'Tool name' : resourceType === 'collections' ? 'Collection name' : 'Article title'}
                </Label>
                <Input
                  id="tool-name"
                  value={toolName}
                  onChange={(e) => setToolName(e.target.value)}
                  placeholder="e.g., Ecodesign Strategy Wheel"
                  disabled={progress !== 'idle'}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">
                    OpenAI API Key
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="openai-key"
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    disabled={progress !== 'idle'}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get your API key from{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      platform.openai.com
                    </a>
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="perplexity-key">
                    Perplexity API Key
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <Input
                    id="perplexity-key"
                    type="password"
                    value={perplexityKey}
                    onChange={(e) => setPerplexityKey(e.target.value)}
                    placeholder="pplx-..."
                    disabled={progress !== 'idle'}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Get your API key from{' '}
                    <a
                      href="https://www.perplexity.ai/settings/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      perplexity.ai
                    </a>
                  </p>
                </div>
              </div>

              {/* Email alternative option */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Don't have API keys?</strong> You can send the tool information and files via email, and we'll create the page for you.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendEmail}
                    disabled={progress !== 'idle'}
                    className="whitespace-nowrap"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Send via email
                  </Button>
                </div>
                {showEmailFallback && (
                  <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      If your email client didn't open, please send your files and tool information to:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-white dark:bg-gray-900 rounded border border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 select-all">
                        {CONTACT_EMAIL}
                      </code>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={() => {
                          navigator.clipboard.writeText(CONTACT_EMAIL);
                        }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tool-files">Upload files (up to 10 files: PDF, DOCX, TXT, images)</Label>
              <Input
                id="tool-files"
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.gif,.svg,.webp"
                className="cursor-pointer"
                disabled={progress !== 'idle'}
              />
              {files.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Selected files ({files.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
                      >
                        <span className="text-gray-700 dark:text-gray-300">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          disabled={progress !== 'idle'}
                          aria-label={`Remove ${file.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {progress !== 'idle' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  {progress === 'parsing' && (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>Parsing files...</span>
                    </>
                  )}
                  {progress === 'searching' && (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>Searching web...</span>
                    </>
                  )}
                  {progress === 'generating' && (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>Generating content with AI...</span>
                    </>
                  )}
                  {progress === 'saving' && (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span>Saving tool...</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={handleGenerate}
                disabled={!toolName.trim() || !openaiKey.trim() || !perplexityKey.trim() || progress !== 'idle'}
              >
                {progress !== 'idle' ? 'Processing...' : `Generate ${resourceType === 'tools' ? 'tool' : resourceType === 'collections' ? 'collection' : 'article'} page`}
              </Button>
            </div>
          </>
      </section>
    </div>
  );
}
