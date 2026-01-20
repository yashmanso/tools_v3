export interface WelcomeAnswers {
  role?: string;
  goal?: string;
  stage?: string;
}

/**
 * Get welcome answers from localStorage
 */
export function getWelcomeAnswers(): WelcomeAnswers {
  if (typeof window === 'undefined') return {};
  
  try {
    const saved = localStorage.getItem('welcome-answers');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to parse welcome answers:', e);
  }
  
  return {};
}

/**
 * Check if welcome has been completed
 */
export function hasCompletedWelcome(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('welcome-completed') === 'true';
}

/**
 * Score a resource based on welcome answers
 */
export function scoreResourceByWelcomeAnswers(
  resource: { tags: string[]; title: string; overview?: string },
  answers: WelcomeAnswers
): number {
  if (!answers || Object.keys(answers).length === 0) {
    return 0;
  }

  let score = 0;
  const answerValues = Object.values(answers).filter(Boolean) as string[];

  answerValues.forEach((answer) => {
    // Direct tag match - highest priority
    if (resource.tags.includes(answer)) {
      score += 20;
    } else {
      // Partial tag match
      const matchingTag = resource.tags.find(tag => {
        const tagLower = tag.toLowerCase().replace(/[#-]/g, '');
        const answerLower = answer.toLowerCase().replace(/[#-]/g, '');
        return tagLower.includes(answerLower) || answerLower.includes(tagLower);
      });
      if (matchingTag) {
        score += 10;
      } else {
        // Check title
        if (resource.title.toLowerCase().includes(answer.toLowerCase())) {
          score += 5;
        }
        // Check overview
        if (resource.overview?.toLowerCase().includes(answer.toLowerCase())) {
          score += 3;
        }
      }
    }
  });

  // Stage-specific bonus
  if (answers.stage) {
    const stageTags = ['ideation', 'design', 'development', 'implementation', 'optimization'];
    if (stageTags.some(stage => resource.tags.includes(stage) && stage === answers.stage)) {
      score += 15;
    }
  }

  return score;
}

/**
 * Reorder resources based on welcome answers
 */
export function reorderResourcesByWelcomeAnswers<T extends { tags: string[]; title: string; overview?: string }>(
  resources: T[],
  answers: WelcomeAnswers
): T[] {
  if (!answers || Object.keys(answers).length === 0) {
    return resources;
  }

  const scored = resources.map(resource => ({
    resource,
    score: scoreResourceByWelcomeAnswers(resource, answers),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .map(item => item.resource);
}
