'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ResourceMetadata } from '../lib/markdown';

interface WelcomePopupProps {
  allResources: ResourceMetadata[];
}

interface WelcomeAnswers {
  role?: string;
  goal?: string;
  stage?: string;
}

const WELCOME_QUESTIONS = [
  {
    id: 'role',
    question: 'What best describes you?',
    description: 'Help us personalize your experience',
    options: [
      { value: 'entrepreneur', label: 'Entrepreneur / Founder' },
      { value: 'researcher', label: 'Researcher / Academic' },
      { value: 'practitioner', label: 'Practitioner / Consultant' },
      { value: 'student', label: 'Student / Learner' },
      { value: 'educator', label: 'Educator / Teacher' },
    ],
  },
  {
    id: 'goal',
    question: 'What are you trying to accomplish?',
    description: 'Select your primary objective',
    options: [
      { value: 'find-tool', label: 'Find a specific tool' },
      { value: 'learn', label: 'Learn and explore' },
      { value: 'research', label: 'Research and study' },
      { value: 'compare', label: 'Compare options' },
    ],
  },
  {
    id: 'stage',
    question: 'Where are you in your journey?',
    description: 'This helps us prioritize relevant resources',
    options: [
      { value: 'ideation', label: 'Ideation - Exploring ideas' },
      { value: 'design', label: 'Design - Designing solutions' },
      { value: 'development', label: 'Development - Building' },
      { value: 'implementation', label: 'Implementation - Executing' },
      { value: 'optimization', label: 'Optimization - Improving' },
    ],
  },
];

export function WelcomePopup({ allResources }: WelcomePopupProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1); // Start at -1 for intro screen
  const [answers, setAnswers] = useState<WelcomeAnswers>({});
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check if user has already completed the welcome
    const hasCompletedWelcome = localStorage.getItem('welcome-completed');
    if (!hasCompletedWelcome) {
      // Show popup after a short delay
      setTimeout(() => setIsOpen(true), 500);
    } else {
      // Load saved answers
      const savedAnswers = localStorage.getItem('welcome-answers');
      if (savedAnswers) {
        try {
          setAnswers(JSON.parse(savedAnswers));
        } catch (e) {
          console.error('Failed to parse saved answers:', e);
        }
      }
    }
  }, []);

  const handleStart = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(0);
      setIsAnimating(false);
    }, 300);
  };

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setIsAnimating(true);

    setTimeout(() => {
      if (currentStep < WELCOME_QUESTIONS.length - 1) {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      } else {
        // Last question - save answers and redirect to homepage
        const finalAnswers = { ...answers, [questionId]: value };
        localStorage.setItem('welcome-answers', JSON.stringify(finalAnswers));
        localStorage.setItem('welcome-completed', 'true');
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('welcome-answers-updated', { 
          detail: finalAnswers 
        }));
        
        setIsOpen(false);
        setTimeout(() => {
          router.push('/');
        }, 300);
      }
    }, 300);
  };


  const handleSkip = () => {
    localStorage.setItem('welcome-completed', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  // Intro screen
  if (currentStep === -1) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div
          className={`relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Welcome to Sustainability Atlas
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Let's personalize your experience
                </p>
              </div>
              <button
                onClick={handleSkip}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                aria-label="Skip"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">
                Quick Personalization
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We'll ask you three quick questions to understand your needs and preferences.
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Based on your answers, we'll organize the tools, collections, and articles to show you the most relevant content first.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">What you'll get:</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Personalized content recommendations
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Reorganized tools and resources based on your profile
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Quick access to what matters most to you
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-4 py-2"
              >
                Skip for now
              </button>
              <button
                onClick={handleStart}
                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = WELCOME_QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / WELCOME_QUESTIONS.length) * 100;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div
        className={`relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Welcome to Sustainability Atlas
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Let's personalize your experience
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Skip"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Question {currentStep + 1} of {WELCOME_QUESTIONS.length}
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {currentQuestion.question}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {currentQuestion.description}
          </p>

          <div className="grid sm:grid-cols-2 gap-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  answers[currentQuestion.id as keyof WelcomeAnswers] === option.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between">
            {currentStep > 0 && (
              <button
                onClick={() => {
                  setCurrentStep(currentStep - 1);
                  setIsAnimating(false);
                }}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                ← Previous
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={handleSkip}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
