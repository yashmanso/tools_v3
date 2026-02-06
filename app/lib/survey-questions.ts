export type QuestionType = 
  | 'likert' // 1-5 scale
  | 'multiple-choice-single' // Single selection
  | 'multiple-choice-multiple' // Select all that apply
  | 'text' // Free text input
  | 'conditional'; // Shows follow-up based on answer

export interface QuestionOption {
  label: string;
  value: string;
  hasTextInput?: boolean; // For "Other: ..." options
}

export interface ConditionalQuestion {
  condition: {
    questionId: string;
    value: string | string[]; // Value(s) that trigger this question
  };
  question: SurveyQuestion;
}

export interface SurveyQuestion {
  id: string;
  part: 'I' | 'II';
  text: string;
  type: QuestionType;
  options?: QuestionOption[];
  placeholder?: string;
  required?: boolean;
  conditional?: ConditionalQuestion;
  subQuestions?: SurveyQuestion[]; // For nested questions like "rate each 1-5"
  showWhen?: { questionId: string; value: string | string[] }; // Show this question only when condition is met
}

export const surveyQuestions: SurveyQuestion[] = [
  // Part I
  {
    id: 'q1',
    part: 'I',
    text: 'When you first landed on the Home page, how quickly and clearly did you understand the platform\'s purpose?',
    type: 'likert',
    required: true,
  },
  {
    id: 'q2',
    part: 'I',
    text: 'Did you immediately know how to proceed (where to click next)?',
    type: 'multiple-choice-single',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'Somewhat', value: 'somewhat' },
      { label: 'No', value: 'no' },
    ],
    required: true,
  },
  {
    id: 'q3',
    part: 'I',
    text: 'What would make the Home page more engaging or clear?',
    type: 'multiple-choice-multiple',
    options: [
      { label: 'Clearer call-to-action', value: 'clearer-cta' },
      { label: 'Short intro video', value: 'intro-video' },
      { label: 'Quick pathways (teacher, researcher, practitioner, or student)', value: 'quick-pathways' },
      { label: 'Example journey', value: 'example-journey' },
      { label: 'Other', value: 'other', hasTextInput: true },
    ],
  },
  {
    id: 'q4',
    part: 'I',
    text: 'How easy was it to find tools, frameworks, or resources relevant to your needs?',
    type: 'likert',
    required: true,
  },
  {
    id: 'q5',
    part: 'I',
    text: 'How easy was it to determine whether a tool you looked at fits your context (e.g., course, research, project)?',
    type: 'likert',
    required: true,
  },
  {
    id: 'q6',
    part: 'I',
    text: 'How well did an individual tool page explain what the tool is for (e.g., ideation, problem-solving)?',
    type: 'likert',
    required: true,
  },
  {
    id: 'q7',
    part: 'I',
    text: 'What determines your seeking of a tool?',
    type: 'multiple-choice-multiple',
    options: [
      { label: 'Specific teaching module need', value: 'teaching-module' },
      { label: 'Research project design', value: 'research-project' },
      { label: 'Workshop facilitation', value: 'workshop' },
      { label: 'Inspiration or exploration', value: 'inspiration' },
      { label: 'Other', value: 'other', hasTextInput: true },
    ],
  },
  {
    id: 'q8',
    part: 'I',
    text: 'What is the main benefits of your use of the toolbox?',
    type: 'multiple-choice-multiple',
    options: [
      { label: 'Discovery of new tools', value: 'discovery' },
      { label: 'Better structure for sessions', value: 'structure' },
      { label: 'New methods discovery', value: 'methods' },
      { label: 'Clearer sustainable entrepreneurship and innovation (SEI) alignment', value: 'sei-alignment' },
      { label: 'Higher student and participant engagement', value: 'engagement' },
      { label: 'Other', value: 'other', hasTextInput: true },
    ],
  },
  {
    id: 'q9',
    part: 'I',
    text: 'Did you encounter difficulties while navigating the toolbox?',
    type: 'multiple-choice-single',
    options: [
      { label: 'No difficulties', value: 'no' },
      { label: 'Some difficulties', value: 'yes' },
    ],
    required: true,
    conditional: {
      condition: { questionId: 'q9', value: 'yes' },
      question: {
        id: 'q9a',
        part: 'I',
        text: 'If difficulties: what types?',
        type: 'multiple-choice-multiple',
        options: [
          { label: 'Confusing page layout', value: 'layout' },
          { label: 'Too many clicks', value: 'clicks' },
          { label: 'Inconsistent labels', value: 'labels' },
          { label: 'Dead or old links', value: 'links' },
          { label: 'Other', value: 'other', hasTextInput: true },
        ],
      },
    },
  },
  {
    id: 'q10',
    part: 'I',
    text: 'Was the tagging and organization logic (categories, pathways, etc.) clear and useful?',
    type: 'likert',
    required: true,
  },
  {
    id: 'q11',
    part: 'I',
    text: 'Was the overall organizational structure (headings, categories, tags, or dimensions) clear and logical?',
    type: 'likert',
    required: true,
  },
  {
    id: 'q12',
    part: 'I',
    text: 'Was the search feature helpful for locating specific content?',
    type: 'likert',
    required: true,
  },
  {
    id: 'q13',
    part: 'I',
    text: 'Were there resources you expected to find but did not?',
    type: 'multiple-choice-single',
    options: [
      { label: 'No', value: 'no' },
      { label: 'Yes', value: 'yes' },
    ],
    required: true,
    conditional: {
      condition: { questionId: 'q13', value: 'yes' },
      question: {
        id: 'q13a',
        part: 'I',
        text: 'Please list the resources you expected to find:',
        type: 'text',
        placeholder: 'List resources...',
      },
    },
  },
  {
    id: 'q14',
    part: 'I',
    text: 'Which tools did you first learn about through this toolbox?',
    type: 'text',
    placeholder: 'List tools...',
  },
  {
    id: 'q15',
    part: 'I',
    text: 'Which tools from the toolbox have you used in your practice, teaching, or research?',
    type: 'text',
    placeholder: 'List tools...',
  },
  {
    id: 'q16',
    part: 'I',
    text: 'In which of the following contexts have you used the toolbox?',
    type: 'multiple-choice-multiple',
    options: [
      { label: 'Personal practice', value: 'personal' },
      { label: 'Teaching and facilitation', value: 'teaching' },
      { label: 'Research or academic projects', value: 'research' },
      { label: 'Professional practice', value: 'professional' },
      { label: 'Student projects', value: 'student' },
      { label: 'Other', value: 'other', hasTextInput: true },
    ],
  },
  {
    id: 'q17',
    part: 'I',
    text: 'Would you be interested in providing examples or case studies of tool application?',
    type: 'multiple-choice-single',
    options: [
      { label: 'Yes', value: 'yes' },
      { label: 'Maybe later', value: 'maybe' },
      { label: 'No', value: 'no' },
    ],
    required: true,
  },
  {
    id: 'q17a',
    part: 'I',
    text: 'Please provide your email address so we can contact you:',
    type: 'text',
    placeholder: 'your.email@example.com',
    showWhen: { questionId: 'q17', value: ['yes', 'maybe'] },
  },
  {
    id: 'q18',
    part: 'I',
    text: 'One last thing: Please determine a specific purpose, visit the toolbox, select two tools, and share your experience of the process.',
    type: 'text',
    placeholder: 'Share your experience...',
  },
  
  // Part II
  {
    id: 'q20',
    part: 'II',
    text: 'In your work, teaching, or research, how often do you look for new tools or methods related to SEI?',
    type: 'multiple-choice-single',
    options: [
      { label: 'Seldom', value: 'seldom' },
      { label: 'Occasionally', value: 'occasionally' },
      { label: 'Actively', value: 'actively' },
    ],
    required: true,
  },
  {
    id: 'q21',
    part: 'II',
    text: 'Where do you usually discover new tools or resources?',
    type: 'multiple-choice-multiple',
    options: [
      { label: 'Academic literature', value: 'academic' },
      { label: 'Peer recommendations', value: 'peer' },
      { label: 'Workshops', value: 'workshops' },
      { label: 'Online repositories or toolboxes', value: 'online' },
      { label: 'Social media or newsletters', value: 'social' },
      { label: 'Courses or conferences', value: 'courses' },
      { label: 'Other', value: 'other', hasTextInput: true },
    ],
  },
  {
    id: 'q22',
    part: 'II',
    text: 'When choosing a tool or framework, how important are the following?',
    type: 'multiple-choice-multiple',
    subQuestions: [
      {
        id: 'q22a',
        part: 'II',
        text: 'Clarity of purpose',
        type: 'likert',
        required: true,
      },
      {
        id: 'q22b',
        part: 'II',
        text: 'Evidence base and academic validation',
        type: 'likert',
        required: true,
      },
      {
        id: 'q22c',
        part: 'II',
        text: 'Time required to use',
        type: 'likert',
        required: true,
      },
      {
        id: 'q22d',
        part: 'II',
        text: 'Data requirements and feasibility',
        type: 'likert',
        required: true,
      },
      {
        id: 'q22e',
        part: 'II',
        text: 'Applicability to industry and other setting',
        type: 'likert',
        required: true,
      },
      {
        id: 'q22f',
        part: 'II',
        text: 'Ease of facilitation',
        type: 'likert',
        required: true,
      },
      {
        id: 'q22g',
        part: 'II',
        text: 'Fit with learning outcomes (in teaching)',
        type: 'likert',
        required: true,
      },
    ],
  },
  {
    id: 'q23',
    part: 'II',
    text: 'How do you decide whether a tool is fit for purpose?',
    type: 'multiple-choice-multiple',
    options: [
      { label: 'Pilot in a small session', value: 'pilot' },
      { label: 'Review academic sources', value: 'academic' },
      { label: 'Peer recommendations', value: 'peer' },
      { label: 'Student or participant feedback', value: 'feedback' },
      { label: 'Personal experience', value: 'experience' },
      { label: 'Other', value: 'other', hasTextInput: true },
    ],
  },
  {
    id: 'q24',
    part: 'II',
    text: 'When integrating a tool, how (and how much) do you usually adapt it?',
    type: 'multiple-choice-multiple',
    options: [
      { label: 'Use as provided', value: 'as-provided' },
      { label: 'Simplify or shorten', value: 'simplify' },
      { label: 'Combine with other methods', value: 'combine' },
      { label: 'Contextualize', value: 'contextualize' },
      { label: 'Modify visuals and language', value: 'modify' },
      { label: 'Other', value: 'other', hasTextInput: true },
    ],
  },
  {
    id: 'q25',
    part: 'II',
    text: 'When you use a tool, how do you determine their impact?',
    type: 'text',
    placeholder: 'Specify...',
  },
  {
    id: 'q26',
    part: 'II',
    text: 'How do you usually evaluate outcomes after applying a tool?',
    type: 'text',
    placeholder: 'Specify...',
  },
  {
    id: 'q27',
    part: 'II',
    text: 'What barriers prevent you from using certain tools?',
    type: 'multiple-choice-multiple',
    options: [
      { label: 'Lack of time to learn', value: 'time' },
      { label: 'Poor documentation', value: 'documentation' },
      { label: 'Unclear link to outcomes', value: 'outcomes' },
      { label: 'Too complex', value: 'complex' },
      { label: 'Misfit with context', value: 'misfit' },
      { label: 'Other', value: 'other', hasTextInput: true },
    ],
  },
  {
    id: 'q28',
    part: 'II',
    text: 'Can you share an example of a tool that had significant impact on your teaching, research, or other projects?',
    type: 'text',
    placeholder: 'Share your example...',
  },
];
