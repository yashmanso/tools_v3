'use client';

import { useState, useEffect, useMemo } from 'react';
import { ResourceMetadata } from '../lib/markdown';
import { Workflow, WorkflowStep, getAllWorkflows, saveWorkflow, deleteWorkflow, getWorkflowTemplates } from '../lib/workflows';
import { PanelLink } from './PanelLink';
import { generateWorkflowShareLink } from '../lib/workflows';

interface WorkflowBuilderProps {
  allResources: ResourceMetadata[];
}

export function WorkflowBuilder({ allResources }: WorkflowBuilderProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<Workflow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [workflowTitle, setWorkflowTitle] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTemplates, setShowTemplates] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareWorkflowId, setShareWorkflowId] = useState<string | null>(null);

  const tools = useMemo(() => {
    return allResources.filter(r => r.category === 'tools');
  }, [allResources]);

  const templates = useMemo(() => {
    return getWorkflowTemplates(allResources);
  }, [allResources]);

  useEffect(() => {
    const loadWorkflows = () => {
      setWorkflows(getAllWorkflows());
    };

    loadWorkflows();
    window.addEventListener('workflows-updated', loadWorkflows);

    return () => {
      window.removeEventListener('workflows-updated', loadWorkflows);
    };
  }, []);

  const handleCreateNew = () => {
    setIsCreating(true);
    setCurrentWorkflow({
      id: `workflow-${Date.now()}`,
      title: '',
      description: '',
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setWorkflowTitle('');
    setWorkflowDescription('');
  };

  const handleSaveWorkflow = () => {
    if (!currentWorkflow || !workflowTitle.trim()) return;

    const workflow: Workflow = {
      ...currentWorkflow,
      title: workflowTitle,
      description: workflowDescription,
      updatedAt: new Date().toISOString(),
    };

    saveWorkflow(workflow);
    setWorkflows(getAllWorkflows());
    setIsCreating(false);
    setCurrentWorkflow(null);
    setWorkflowTitle('');
    setWorkflowDescription('');
  };

  const handleAddTool = (tool: ResourceMetadata) => {
    if (!currentWorkflow) return;

    const newStep: WorkflowStep = {
      toolId: `${tool.category}/${tool.slug}`,
      tool,
      order: currentWorkflow.steps.length + 1,
    };

    setCurrentWorkflow({
      ...currentWorkflow,
      steps: [...currentWorkflow.steps, newStep],
    });
  };

  const handleRemoveStep = (stepIndex: number) => {
    if (!currentWorkflow) return;

    const newSteps = currentWorkflow.steps
      .filter((_, index) => index !== stepIndex)
      .map((step, index) => ({ ...step, order: index + 1 }));

    setCurrentWorkflow({
      ...currentWorkflow,
      steps: newSteps,
    });
  };

  const handleMoveStep = (stepIndex: number, direction: 'up' | 'down') => {
    if (!currentWorkflow) return;

    const newIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    if (newIndex < 0 || newIndex >= currentWorkflow.steps.length) return;

    const newSteps = [...currentWorkflow.steps];
    [newSteps[stepIndex], newSteps[newIndex]] = [newSteps[newIndex], newSteps[stepIndex]];
    
    const reorderedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index + 1,
    }));

    setCurrentWorkflow({
      ...currentWorkflow,
      steps: reorderedSteps,
    });
  };

  const handleUseTemplate = (template: Workflow) => {
    const newWorkflow: Workflow = {
      ...template,
      id: `workflow-${Date.now()}`,
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentWorkflow(newWorkflow);
    setWorkflowTitle(newWorkflow.title);
    setWorkflowDescription(newWorkflow.description || '');
    setIsCreating(true);
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setCurrentWorkflow(workflow);
    setWorkflowTitle(workflow.title);
    setWorkflowDescription(workflow.description || '');
    setIsCreating(true);
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow(workflowId);
      setWorkflows(getAllWorkflows());
      if (currentWorkflow?.id === workflowId) {
        setCurrentWorkflow(null);
        setIsCreating(false);
      }
    }
  };

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return tools.slice(0, 20);
    const query = searchQuery.toLowerCase();
    return tools.filter(tool =>
      tool.title.toLowerCase().includes(query) ||
      tool.overview?.toLowerCase().includes(query) ||
      tool.tags.some(tag => tag.toLowerCase().includes(query))
    ).slice(0, 20);
  }, [tools, searchQuery]);

  if (isCreating && currentWorkflow) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => {
              setIsCreating(false);
              setCurrentWorkflow(null);
              setWorkflowTitle('');
              setWorkflowDescription('');
            }}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 inline-flex items-center gap-2"
          >
            ← Back to workflows
          </button>
          <div className="flex gap-2">
            {currentWorkflow.id && workflows.some(w => w.id === currentWorkflow.id) && (
              <button
                onClick={() => {
                  setShareWorkflowId(currentWorkflow.id);
                  setShowShareModal(true);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                Share
              </button>
            )}
            <button
              onClick={handleSaveWorkflow}
              disabled={!workflowTitle.trim() || currentWorkflow.steps.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save workflow
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Workflow Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workflow Info */}
            <div className="bg-[var(--bg-secondary)] rounded-3xl border border-gray-200 dark:border-gray-700 p-6">
              <input
                type="text"
                placeholder="Workflow title..."
                value={workflowTitle}
                onChange={(e) => setWorkflowTitle(e.target.value)}
                className="w-full text-2xl font-bold mb-3 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
              <textarea
                placeholder="Describe what this workflow helps accomplish..."
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none outline-none resize-none"
                rows={3}
              />
            </div>

            {/* Workflow Steps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Workflow Steps ({currentWorkflow.steps.length})
              </h3>

              {currentWorkflow.steps.length === 0 ? (
                <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-3xl border border-gray-200 dark:border-gray-700 border-dashed">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No tools added yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">Search and add tools from the right panel</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentWorkflow.steps.map((step, index) => (
                    <div
                      key={`${step.toolId}-${index}`}
                      className="bg-[var(--bg-secondary)] rounded-3xl border border-gray-200 dark:border-gray-700 p-6 relative group"
                    >
                      {/* Step Number */}
                      <div className="absolute top-6 left-6 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        {step.order}
                      </div>

                      <div className="ml-12">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {step.tool.title}
                            </h4>
                          </div>
                        </div>

                        {/* Step Controls */}
                        <div className="flex items-center gap-2 mt-4">
                          <button
                            onClick={() => handleMoveStep(index, 'up')}
                            disabled={index === 0}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Move up"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleMoveStep(index, 'down')}
                            disabled={index === currentWorkflow.steps.length - 1}
                            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            title="Move down"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemoveStep(index)}
                            className="p-2 rounded-lg border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Remove"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          <PanelLink
                            href={`/${step.tool.category}/${step.tool.slug}`}
                            className="ml-auto px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full hover:border-blue-500 dark:hover:border-blue-500 transition-colors hover:no-underline"
                          >
                            View tool →
                          </PanelLink>
                        </div>
                      </div>

                      {/* Connection Arrow */}
                      {index < currentWorkflow.steps.length - 1 && (
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full flex flex-col items-center">
                          <div className="w-0.5 h-6 bg-blue-400 dark:bg-blue-600"></div>
                          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-400 dark:border-t-blue-600"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Tool Search */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-[var(--bg-secondary)] rounded-3xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Add tools to workflow
                </h3>
                <input
                  type="text"
                  placeholder="Search tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 mb-4 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {filteredTools.map((tool) => {
                    const isAdded = currentWorkflow.steps.some(step => step.toolId === `${tool.category}/${tool.slug}`);
                    return (
                      <div
                        key={tool.slug}
                        className={`p-4 rounded-xl border transition-all ${
                          isAdded
                            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer'
                        }`}
                        onClick={() => !isAdded && handleAddTool(tool)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              {tool.title}
                            </h4>
                          </div>
                          {isAdded && (
                            <div className="ml-2 text-green-600 dark:text-green-400">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && shareWorkflowId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-[var(--bg-secondary)] rounded-3xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Share Workflow
                </h3>
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setShareWorkflowId(null);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Copy this link to share your workflow:
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  readOnly
                  value={generateWorkflowShareLink(shareWorkflowId)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateWorkflowShareLink(shareWorkflowId));
                    alert('Link copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Copy
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Note: Shared workflows are read-only. Recipients can view but not edit.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Tool Workflows</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create step-by-step workflows combining multiple tools for your sustainability projects
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
        >
          + Create workflow
        </button>
      </div>

      {/* Templates Section */}
      {showTemplates && templates.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Workflow Templates
            </h3>
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              {showTemplates ? 'Hide' : 'Show'} templates
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-[var(--bg-secondary)] rounded-3xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group"
                onClick={() => handleUseTemplate(template)}
              >
                <h4 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {template.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {template.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {template.steps.length} steps
                  </span>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Use template →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Workflows */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Your Workflows ({workflows.length})
        </h3>
        {workflows.length === 0 ? (
          <div className="text-center py-12 bg-[var(--bg-secondary)] rounded-3xl border border-gray-200 dark:border-gray-700 border-dashed">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No workflows yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              Create a new workflow or start from a template
            </p>
            <button
              onClick={handleCreateNew}
              className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Create your first workflow
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => handleEditWorkflow(workflow)}
                className="bg-[var(--bg-secondary)] rounded-3xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {workflow.title}
                  </h4>
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareWorkflowId(workflow.id);
                        setShowShareModal(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="Share workflow"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkflow(workflow.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Delete workflow"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                {workflow.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {workflow.description}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {workflow.steps.length} steps
                  </span>
                  <span className="text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:underline">
                    View workflow →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && shareWorkflowId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-[var(--bg-secondary)] rounded-3xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Share Workflow
              </h3>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setShareWorkflowId(null);
                }}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Copy this link to share your workflow:
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={generateWorkflowShareLink(shareWorkflowId)}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateWorkflowShareLink(shareWorkflowId));
                  alert('Link copied to clipboard!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Note: Shared workflows are read-only. Recipients can view but not edit.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
