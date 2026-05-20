import type {
  Interview,
  Question,
  AnalysisResult,
  ProgressMetrics,
  User,
  InterviewTrack,
  DifficultyLevel,
} from './types';

export const mockUser: User = {
  id: '1',
  name: 'Alex Chen',
  email: 'alex@example.com',
  preferredTrack: 'frontend',
  targetCompanies: ['Vercel', 'Stripe', 'Linear', 'Meta'],
  targetLevel: 'senior',
};

export const frontendQuestions: Question[] = [
  {
    id: 'q1',
    text: 'Explain how React\'s reconciliation algorithm works. What are the key optimizations that make it efficient?',
    track: 'frontend',
    difficulty: 'medium',
    topics: ['React', 'Reconciliation', 'Performance'],
    company: 'Meta',
  },
  {
    id: 'q2',
    text: 'What happens when you execute `setTimeout(() => console.log("A"), 0)` followed by `Promise.resolve().then(() => console.log("B"))`? Explain the event loop.',
    track: 'frontend',
    difficulty: 'medium',
    topics: ['JavaScript', 'Event Loop', 'Async'],
  },
  {
    id: 'q3',
    text: 'How would you optimize a React component that renders a list of 10,000 items? Walk me through multiple approaches.',
    track: 'frontend',
    difficulty: 'hard',
    topics: ['React', 'Performance', 'Virtualization'],
    company: 'Vercel',
  },
  {
    id: 'q4',
    text: 'Explain the difference between CSS Grid and Flexbox. When would you use each?',
    track: 'frontend',
    difficulty: 'easy',
    topics: ['CSS', 'Layout'],
  },
  {
    id: 'q5',
    text: 'What are React Server Components and how do they differ from traditional SSR?',
    track: 'frontend',
    difficulty: 'hard',
    topics: ['React', 'RSC', 'SSR'],
    company: 'Vercel',
  },
];

export const backendQuestions: Question[] = [
  {
    id: 'q6',
    text: 'Design a rate limiting system for an API. How would you handle distributed rate limiting across multiple servers?',
    track: 'backend',
    difficulty: 'hard',
    topics: ['System Design', 'Distributed Systems', 'Rate Limiting'],
  },
  {
    id: 'q7',
    text: 'Explain the CAP theorem and provide real-world examples of databases that prioritize different guarantees.',
    track: 'backend',
    difficulty: 'medium',
    topics: ['Databases', 'Distributed Systems', 'CAP Theorem'],
  },
];

export const mockAnalyses: AnalysisResult[] = [
  {
    id: 'a1',
    questionId: 'q1',
    answer: 'React uses a virtual DOM and diffing algorithm...',
    strengths: [
      'Correctly identified the virtual DOM concept',
      'Mentioned key reconciliation',
      'Understanding of component tree comparison',
    ],
    gaps: [
      'Did not mention fiber architecture',
      'Missing explanation of time slicing',
      'No discussion of priority-based rendering',
    ],
    idealAnswer:
      'React\'s reconciliation uses the Fiber architecture to efficiently update the DOM. Key optimizations include: 1) Virtual DOM diffing with O(n) complexity using heuristics, 2) Key-based reconciliation for lists, 3) Time slicing for interruptible rendering, 4) Priority-based updates (urgent vs transitions), 5) Batching state updates. The Fiber architecture allows React to pause, abort, or resume work, making rendering non-blocking.',
    scores: [
      { name: 'Technical Accuracy', score: 7, maxScore: 10 },
      { name: 'Depth of Knowledge', score: 5, maxScore: 10 },
      { name: 'Practical Application', score: 6, maxScore: 10 },
      { name: 'Communication Clarity', score: 8, maxScore: 10 },
      { name: 'Problem Solving', score: 6, maxScore: 10 },
      { name: 'Senior-Level Thinking', score: 5, maxScore: 10 },
    ],
    overallScore: 6.2,
    seniorityLevel: 'mid',
    hiringSignal: 'lean-hire',
    followUpQuestions: [
      'How does React decide which updates are urgent vs transitions?',
      'What is the difference between rendering and committing in React?',
      'Can you explain how concurrent rendering works?',
    ],
    coachingAdvice: [
      'Study the Fiber architecture in depth - it\'s fundamental to modern React',
      'Read the React RFC on concurrent features',
      'Practice explaining trade-offs between different reconciliation strategies',
    ],
    timestamp: new Date('2024-01-15T10:30:00'),
  },
];

export const mockInterviews: Interview[] = [
  {
    id: 'int1',
    track: 'frontend',
    mode: 'practice',
    status: 'completed',
    startedAt: new Date('2024-01-15T10:00:00'),
    completedAt: new Date('2024-01-15T11:30:00'),
    questions: [frontendQuestions[0], frontendQuestions[1]],
    analyses: [mockAnalyses[0]],
    currentQuestionIndex: 0,
    overallScore: 6.2,
    seniorityLevel: 'mid',
    hiringSignal: 'lean-hire',
  },
  {
    id: 'int2',
    track: 'frontend',
    mode: 'dream-job',
    status: 'active',
    startedAt: new Date('2024-01-20T14:00:00'),
    questions: [frontendQuestions[2]],
    analyses: [],
    currentQuestionIndex: 0,
  },
];

export const mockProgress: ProgressMetrics = {
  totalInterviews: 12,
  averageScore: 7.4,
  seniorityLevel: 'senior',
  strongTopics: ['React', 'TypeScript', 'Performance'],
  weakTopics: ['System Design', 'Security', 'Testing'],
  scoreHistory: [
    { date: new Date('2024-01-01'), score: 6.2 },
    { date: new Date('2024-01-05'), score: 6.8 },
    { date: new Date('2024-01-10'), score: 7.1 },
    { date: new Date('2024-01-15'), score: 7.5 },
    { date: new Date('2024-01-20'), score: 7.8 },
    { date: new Date('2024-01-25'), score: 8.0 },
  ],
  topicScores: [
    { topic: 'React', score: 8.5 },
    { topic: 'JavaScript', score: 8.2 },
    { topic: 'TypeScript', score: 7.8 },
    { topic: 'Performance', score: 7.5 },
    { topic: 'CSS', score: 7.0 },
    { topic: 'Accessibility', score: 6.5 },
    { topic: 'Testing', score: 6.0 },
    { topic: 'Security', score: 5.8 },
  ],
};

export const companies = [
  'Vercel',
  'Meta',
  'Google',
  'Amazon',
  'Netflix',
  'Stripe',
  'Linear',
  'Airbnb',
  'Shopify',
  'Notion',
];

export const topics = [
  'JavaScript',
  'React',
  'TypeScript',
  'Performance',
  'CSS',
  'Accessibility',
  'Security',
  'Testing',
  'System Design',
  'Algorithms',
  'Data Structures',
];

export function generateMockQuestion(
  track: InterviewTrack,
  difficulty: DifficultyLevel
): Question {
  const questions = track === 'frontend' ? frontendQuestions : backendQuestions;
  const filtered = questions.filter((q) => q.difficulty === difficulty);
  return filtered[Math.floor(Math.random() * filtered.length)] || questions[0];
}
