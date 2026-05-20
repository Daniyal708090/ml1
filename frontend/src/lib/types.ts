export type InterviewTrack = 'frontend' | 'backend' | 'fullstack';

export type InterviewMode =
  | 'practice'
  | 'analysis'
  | 'question-bank'
  | 'deep-dive'
  | 'weak-spot'
  | 'dream-job';

export type SeniorityLevel = 'junior' | 'mid' | 'senior' | 'staff' | 'principal';

export type HiringSignal = 'hire' | 'lean-hire' | 'lean-no-hire' | 'no-hire';

export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface ScoreDimension {
  name: string;
  score: number;
  maxScore: number;
}

export interface AnalysisResult {
  id: string;
  questionId: string;
  answer: string;
  strengths: string[];
  gaps: string[];
  idealAnswer: string;
  scores: ScoreDimension[];
  overallScore: number;
  seniorityLevel: SeniorityLevel;
  hiringSignal: HiringSignal;
  followUpQuestions: string[];
  coachingAdvice: string[];
  timestamp: Date;
}

export interface Question {
  id: string;
  text: string;
  track: InterviewTrack;
  difficulty: DifficultyLevel;
  topics: string[];
  company?: string;
}

export interface Interview {
  id: string;
  track: InterviewTrack;
  mode: InterviewMode;
  status: 'active' | 'completed' | 'paused';
  startedAt: Date;
  completedAt?: Date;
  questions: Question[];
  analyses: AnalysisResult[];
  currentQuestionIndex: number;
  overallScore?: number;
  seniorityLevel?: SeniorityLevel;
  hiringSignal?: HiringSignal;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: AnalysisResult;
}

export interface ProgressMetrics {
  totalInterviews: number;
  averageScore: number;
  seniorityLevel: SeniorityLevel;
  strongTopics: string[];
  weakTopics: string[];
  scoreHistory: { date: Date; score: number }[];
  topicScores: { topic: string; score: number }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferredTrack: InterviewTrack;
  targetCompanies: string[];
  targetLevel: SeniorityLevel;
}
