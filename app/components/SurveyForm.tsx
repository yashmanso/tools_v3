'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { surveyQuestions, type SurveyQuestion } from '../lib/survey-questions';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SurveyFormProps {
  onSubmit: (data: Record<string, any>) => void;
}

export function SurveyForm({ onSubmit }: SurveyFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [currentPart, setCurrentPart] = useState<'I' | 'II'>('I');
  const [showPartII, setShowPartII] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLDivElement>(null);

  // Get questions by part (don't flatten sub-questions - they're rendered by their parent)
  const partIQuestions = surveyQuestions.filter(q => q.part === 'I');
  const partIIQuestions = surveyQuestions.filter(q => q.part === 'II');

  const currentQuestions = currentPart === 'I' ? partIQuestions : partIIQuestions;

  const handleChange = (questionId: string, value: any) => {
    setFormData(prev => ({ ...prev, [questionId]: value }));
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };


  const validatePart = (questions: SurveyQuestion[]) => {
    const newErrors: Record<string, string> = {};
    
    questions.forEach(question => {
      if (question.required && !formData[question.id]) {
        newErrors[question.id] = 'This question is required';
      }
      
      // Check sub-questions
      if (question.subQuestions) {
        question.subQuestions.forEach(subQ => {
          if (subQ.required && !formData[subQ.id]) {
            newErrors[subQ.id] = 'This question is required';
          }
        });
      }
      
      // Check conditional questions
      if (question.conditional) {
        const conditionValue = formData[question.conditional.condition.questionId];
        const conditionMet = Array.isArray(question.conditional.condition.value)
          ? question.conditional.condition.value.includes(conditionValue)
          : conditionValue === question.conditional.condition.value;
        
        if (conditionMet && question.conditional.question.required && !formData[question.conditional.question.id]) {
          newErrors[question.conditional.question.id] = 'This question is required';
        }
      }
    });

    setErrors(newErrors);
    
    // Scroll to first error if any
    if (Object.keys(newErrors).length > 0) {
      const firstErrorId = Object.keys(newErrors)[0];
      setTimeout(() => {
        const errorElement = document.getElementById(`${firstErrorId}-1`) || 
                            document.querySelector(`[id^="${firstErrorId}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
    
    return Object.keys(newErrors).length === 0;
  };

  // Scroll to top when part changes
  useEffect(() => {
    if (formRef.current) {
      // Try scrolling the form container
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Also try window scroll as fallback
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Try scrolling the main content area
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent) {
      mainContent.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPart]);

  const handleNextPart = () => {
    if (validatePart(partIQuestions)) {
      setCurrentPart('II');
      setShowPartII(true);
    }
  };

  const handleSubmit = () => {
    if (validatePart(partIIQuestions)) {
      onSubmit(formData);
    }
  };

  const renderQuestion = (question: SurveyQuestion) => {
    const value = formData[question.id];
    const error = errors[question.id];
    const showConditional = question.conditional && 
      (Array.isArray(question.conditional.condition.value)
        ? question.conditional.condition.value.includes(formData[question.conditional.condition.questionId])
        : formData[question.conditional.condition.questionId] === question.conditional.condition.value);

    switch (question.type) {
      case 'likert':
        return (
          <div key={question.id} className="mb-8">
            <Label className="text-base font-medium mb-4 block">
              {question.text} <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={value?.toString() || ''}
              onValueChange={(val) => handleChange(question.id, parseInt(val))}
              className="flex gap-4"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <div key={num} className="flex items-center space-x-2">
                  <RadioGroupItem value={num.toString()} id={`${question.id}-${num}`} />
                  <Label htmlFor={`${question.id}-${num}`} className="cursor-pointer">
                    {num}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        );

      case 'multiple-choice-single':
        return (
          <div key={question.id} className="mb-8">
            <Label className="text-base font-medium mb-4 block">
              {question.text} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <RadioGroup
              value={value || ''}
              onValueChange={(val) => handleChange(question.id, val)}
            >
              {question.options?.map(option => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                  <Label htmlFor={`${question.id}-${option.value}`} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {showConditional && question.conditional && (
              <div className="mt-4 ml-6 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                {renderQuestion(question.conditional.question)}
              </div>
            )}
          </div>
        );

      case 'multiple-choice-multiple':
        return (
          <div key={question.id} className="mb-8">
            <Label className="text-base font-medium mb-4 block">
              {question.text}
            </Label>
            <div className="space-y-3">
              {question.options?.map(option => {
                // Handle both array format (selected values) and object format (with text inputs)
                const selectedValues = Array.isArray(value) ? value : 
                  (typeof value === 'object' && value !== null ? Object.keys(value).filter(k => k !== 'selected') : []);
                const isChecked = selectedValues.includes(option.value);
                const otherText = typeof value === 'object' && value !== null && !Array.isArray(value) 
                  ? value[option.value] || '' 
                  : '';
                
                return (
                  <div key={option.value} className="flex items-start space-x-2">
                    <Checkbox
                      id={`${question.id}-${option.value}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const currentSelected = Array.isArray(value) ? value : 
                          (typeof value === 'object' && value !== null ? Object.keys(value).filter(k => k !== 'selected') : []);
                        
                        if (checked) {
                          // Add to selected
                          const newSelected = [...currentSelected, option.value];
                          // If has text input, store as object with selected array and text
                          if (option.hasTextInput) {
                            handleChange(question.id, {
                              selected: newSelected,
                              [option.value]: '',
                            });
                          } else {
                            handleChange(question.id, newSelected);
                          }
                        } else {
                          // Remove from selected
                          const newSelected = currentSelected.filter((v: string) => v !== option.value);
                          // If has text input and was object, preserve other text inputs
                          if (option.hasTextInput && typeof value === 'object' && value !== null) {
                            const newValue: any = { selected: newSelected };
                            Object.keys(value).forEach(k => {
                              if (k !== option.value && k !== 'selected') {
                                newValue[k] = value[k];
                              }
                            });
                            handleChange(question.id, newSelected.length > 0 ? newValue : newSelected);
                          } else {
                            handleChange(question.id, newSelected);
                          }
                        }
                      }}
                    />
                    <Label htmlFor={`${question.id}-${option.value}`} className="cursor-pointer flex-1">
                      {option.label}
                    </Label>
                    {option.hasTextInput && isChecked && (
                      <Textarea
                        placeholder="Please specify..."
                        value={otherText}
                        onChange={(e) => {
                          const currentSelected = Array.isArray(value) ? value : 
                            (typeof value === 'object' && value !== null ? Object.keys(value).filter(k => k !== 'selected') : []);
                          handleChange(question.id, {
                            selected: currentSelected,
                            [option.value]: e.target.value,
                          });
                        }}
                        className="ml-4 flex-1"
                        rows={2}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        );

      case 'text':
        return (
          <div key={question.id} className="mb-8">
            <Label className="text-base font-medium mb-4 block">
              {question.text} {question.required && <span className="text-red-500">*</span>}
            </Label>
            <Textarea
              value={value || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
              placeholder={question.placeholder || 'Enter your answer...'}
              className="w-full"
              rows={4}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div ref={formRef} className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">
          Part {currentPart} — {currentPart === 'I' ? 'Questions about this toolbox' : 'General practices with tools/toolboxes (SEI)'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {currentPart === 'I' 
            ? 'Please help us evaluate the toolbox by answering the following questions.'
            : 'Please share your general practices and experiences with tools and toolboxes.'}
        </p>
      </div>

      <form className="space-y-6">
        {currentQuestions.map(question => {
          // Check if this question has a showWhen condition
          if (question.showWhen) {
            const conditionValue = formData[question.showWhen.questionId];
            const conditionMet = Array.isArray(question.showWhen.value)
              ? question.showWhen.value.includes(conditionValue)
              : conditionValue === question.showWhen.value;
            
            if (!conditionMet) {
              return null; // Don't render if condition not met
            }
          }
          
          // Skip parent questions that only have sub-questions
          if (question.subQuestions) {
            return (
              <div key={question.id} className="mb-8">
                <Label className="text-base font-medium mb-4 block">
                  {question.text}
                </Label>
                <div className="space-y-6 ml-4">
                  {question.subQuestions.map(subQ => renderQuestion(subQ))}
                </div>
              </div>
            );
          }
          return renderQuestion(question);
        })}

        <div className="flex justify-between mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          {currentPart === 'I' ? (
            <Button
              type="button"
              onClick={handleNextPart}
              className="px-8"
            >
              Continue to Part II
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentPart('I');
                }}
              >
                Back to Part I
              </Button>
              <Button
                type="button"
                onClick={handleSubmit}
                className="px-8"
              >
                Submit Survey
              </Button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
