'use client';

import { useState } from 'react';
import { SurveyForm } from '../components/SurveyForm';
import { Toast } from '../components/Toast';

export default function SurveyPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowSuccess(true);
      } else {
        setShowError(true);
      }
    } catch (error) {
      console.error('Error submitting survey:', error);
      setShowError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Your survey response has been submitted successfully. We appreciate your feedback!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Toolbox evaluation survey</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Your feedback helps us improve the Sustainability Atlas toolbox. This survey is divided into two parts and should take approximately 5-10 minutes to complete.
        </p>
      </div>

      {isSubmitting && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200">Submitting your response...</p>
        </div>
      )}

      <SurveyForm onSubmit={handleSubmit} />

      {showSuccess && (
        <Toast
          message="Survey submitted successfully!"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {showError && (
        <Toast
          message="There was an error submitting your survey. Please try again."
          onClose={() => setShowError(false)}
        />
      )}
    </div>
  );
}
