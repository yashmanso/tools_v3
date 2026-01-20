'use client';

import { useState } from 'react';
import type { ResourceMetadata } from '../lib/markdown';
import { ResourceCard } from './ResourceCard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ToolFinderProps {
  allResources: ResourceMetadata[];
}

interface Answers {
  audience?: string;
  stage?: string;
  sustainabilityFocus?: string;
  objective?: string;
  innovationType?: string;
}

const QUESTIONS = [
  {
    id: 'audience',
    question: 'Who are you?',
    description: 'Select the role that best describes you',
    options: [
      { value: 'entrepreneurs', label: 'Entrepreneur' },
      { value: 'startups', label: 'Startup founder' },
      { value: 'SMEs', label: 'Small/medium business' },
      { value: 'corporations', label: 'Corporation' },
      { value: 'researchers', label: 'Researcher' },
      { value: 'students', label: 'Student' },
      { value: 'educators', label: 'Educator' },
      { value: 'practitioners', label: 'Practitioner' },
      { value: 'nonprofits', label: 'Non-profit' },
    ],
  },
  {
    id: 'stage',
    question: 'Where are you in your journey?',
    description: 'What stage best describes your current situation?',
    options: [
      { value: 'ideation', label: 'Ideation', description: 'Exploring ideas and opportunities' },
      { value: 'design', label: 'Design', description: 'Designing your solution or approach' },
      { value: 'development', label: 'Development', description: 'Building and developing your concept' },
      { value: 'implementation', label: 'Implementation', description: 'Putting your solution into practice' },
      { value: 'startup', label: 'Startup phase', description: 'Early stage startup' },
      { value: 'growth', label: 'Growth', description: 'Scaling and growing your venture' },
      { value: 'scale-up', label: 'Scale-up', description: 'Expanding operations' },
      { value: 'maturity', label: 'Maturity', description: 'Established and optimizing' },
    ],
  },
  {
    id: 'sustainabilityFocus',
    question: 'What sustainability aspect interests you most?',
    description: 'Select your primary focus area',
    options: [
      { value: 'environmental-sustainability', label: 'Environmental', description: 'Climate, resources, ecosystems' },
      { value: 'social-sustainability', label: 'Social', description: 'Community, equity, well-being' },
      { value: 'economic-sustainability', label: 'Economic', description: 'Financial viability, business models' },
      { value: 'circular-economy', label: 'Circular economy', description: 'Waste reduction, resource loops' },
      { value: 'SDGs', label: 'SDGs', description: 'UN Sustainable Development Goals' },
      { value: 'governance', label: 'Governance', description: 'Ethics, transparency, accountability' },
    ],
  },
  {
    id: 'objective',
    question: 'What do you want to accomplish?',
    description: 'What is your primary goal?',
    options: [
      { value: 'map', label: 'Map & understand', description: 'Visualize relationships and systems' },
      { value: 'assess', label: 'Assess & measure', description: 'Evaluate impact and performance' },
      { value: 'report', label: 'Report & communicate', description: 'Document and share results' },
      { value: 'align', label: 'Align & strategize', description: 'Align goals and create strategy' },
    ],
  },
  {
    id: 'innovationType',
    question: 'What type of innovation are you working on?',
    description: 'Select the innovation type that applies',
    options: [
      { value: 'product-innovation', label: 'Product innovation', description: 'New or improved products' },
      { value: 'process-innovation', label: 'Process innovation', description: 'Better ways of doing things' },
      { value: 'business-model-innovation', label: 'Business model innovation', description: 'New ways of creating value' },
      { value: 'social-innovation', label: 'Social innovation', description: 'Solutions to social challenges' },
      { value: 'technological-innovation', label: 'Technological innovation', description: 'Technology-driven solutions' },
    ],
  },
];

export function ToolFinder({ allResources }: ToolFinderProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setShowResults(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  // Score and reorder all tools based on answers
  const getReorderedTools = (): Array<{ tool: ResourceMetadata; score: number; matchPercentage: number }> => {
    const tools = allResources.filter((r) => r.category === 'tools');
    
    if (Object.keys(answers).length === 0) {
      // If no answers, return all tools with score 0
      return tools.map(tool => ({ tool, score: 0, matchPercentage: 0 }));
    }

    const answerValues = Object.values(answers).filter(Boolean);
    const maxPossibleScore = answerValues.length * 20; // Maximum score if all answers match perfectly

    // Score each tool based on how well it matches the answers
    const scoredTools = tools.map((tool) => {
      let score = 0;

      answerValues.forEach((answer) => {
        // Direct tag match - highest priority (20 points)
        if (tool.tags.includes(answer)) {
          score += 20;
        } else {
          // Partial tag match (contains the answer) - 10 points
          const matchingTag = tool.tags.find(tag => {
            const tagLower = tag.toLowerCase().replace(/[#-]/g, '');
            const answerLower = answer.toLowerCase().replace(/[#-]/g, '');
            return tagLower.includes(answerLower) || answerLower.includes(tagLower);
          });
          if (matchingTag) {
            score += 10;
          } else {
            // Check if overview mentions the answer - 3 points
            if (tool.overview?.toLowerCase().includes(answer.toLowerCase())) {
              score += 3;
            }
            
            // Check if title mentions the answer - 5 points
            if (tool.title.toLowerCase().includes(answer.toLowerCase())) {
              score += 5;
            }
          }
        }
      });

      // Additional scoring based on question-specific logic
      if (answers.stage) {
        // Stage-specific tags get bonus
        const stageTags = ['ideation', 'design', 'development', 'implementation', 'startup', 'growth', 'scale-up', 'maturity'];
        if (stageTags.some(stage => tool.tags.includes(stage) && stage === answers.stage)) {
          score += 15;
        }
      }
      
      if (answers.objective) {
        // Objective-specific tags get bonus
        const objectiveTags = ['map', 'assess', 'report', 'align'];
        if (objectiveTags.some(obj => tool.tags.includes(obj) && obj === answers.objective)) {
          score += 15;
        }
      }

      // Calculate match percentage (0-100)
      const matchPercentage = maxPossibleScore > 0 
        ? Math.min(100, Math.round((score / maxPossibleScore) * 100))
        : 0;

      return { tool, score, matchPercentage };
    });

    // Sort by score (highest first), but include ALL tools
    return scoredTools.sort((a, b) => b.score - a.score);
  };

  const reorderedTools = getReorderedTools();
  const currentQuestion = QUESTIONS[currentStep];

  if (showResults) {
    const topMatches = reorderedTools.filter(item => item.score > 0).slice(0, 12);
    const otherTools = reorderedTools.filter(item => item.score === 0);
    
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Tools for You</h2>
              <p className="text-gray-600 dark:text-gray-400">
                {topMatches.length > 0 
                  ? `We've reordered ${reorderedTools.length} tools based on your answers. The most relevant are shown first.`
                  : `Showing all ${reorderedTools.length} tools.`
                }
              </p>
            </div>
            <Button variant="ghost"
              onClick={handleReset}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
            >
              Start Over
            </Button>
          </div>

          {/* Show selected answers */}
          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(answers).map(([key, value]) => {
              const question = QUESTIONS.find((q) => q.id === key);
              const option = question?.options.find((opt) => opt.value === value);
              if (option) {
                return (
                  <span
                    key={key}
                    className="text-xs px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  >
                    {option.label}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Top matches section */}
        {topMatches.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Most Relevant Tools ({topMatches.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topMatches.map((item, idx) => (
                <div key={item.tool.slug} className="relative">
                  <ResourceCard 
                    resource={item.tool} 
                    allResources={allResources} 
                    animationDelay={idx * 50} 
                  />
                  {item.matchPercentage > 0 && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full shadow-lg z-10">
                      {item.matchPercentage}% match
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All other tools section */}
        {otherTools.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              All Other Tools ({otherTools.length})
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherTools.map((item, idx) => (
                <ResourceCard 
                  key={item.tool.slug} 
                  resource={item.tool} 
                  allResources={allResources} 
                  animationDelay={(topMatches.length + idx) * 50} 
                />
              ))}
            </div>
          </div>
        )}

        {/* If no matches but tools exist, show all */}
        {topMatches.length === 0 && reorderedTools.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reorderedTools.map((item, idx) => (
              <ResourceCard 
                key={item.tool.slug} 
                resource={item.tool} 
                allResources={allResources} 
                animationDelay={idx * 50} 
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Question {currentStep + 1} of {QUESTIONS.length}
          </span>
          {currentStep > 0 && (
            <Button variant="ghost"
              onClick={handleBack}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back
            </Button>
          )}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">{currentQuestion.question}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{currentQuestion.description}</p>

        <div className="grid sm:grid-cols-2 gap-3">
          {currentQuestion.options.map((option) => (
            <Button variant="ghost"
              key={option.value}
              onClick={() => handleAnswer(currentQuestion.id, option.value)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                answers[currentQuestion.id as keyof Answers] === option.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
            >
              <div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  {option.label}
                </div>
                {'description' in option && option.description && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {option.description}
                  </div>
                )}
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Skip option */}
      <div className="text-center">
        <Button variant="ghost"
          onClick={() => {
            if (currentStep < QUESTIONS.length - 1) {
              setCurrentStep(currentStep + 1);
            } else {
              setShowResults(true);
            }
          }}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
        >
          Skip this question →
        </Button>
      </div>
    </div>
  );
}

