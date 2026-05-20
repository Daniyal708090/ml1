import { HiringSignal, SeniorityLevel } from '@prisma/client';

export interface ScoreDimension {
  name: string;
  score: number;
  maxScore: number;
}

export interface AnalysisOutput {
  strengths: string[];
  gaps: string[];
  idealAnswer: string;
  scores: ScoreDimension[];
  overallScore: number;
  seniorityLevel: SeniorityLevel;
  hiringSignal: HiringSignal;
  followUpQuestions: string[];
  coachingAdvice: string[];
  behaviouralNotes?: string;
  markdownResponse: string;
}

const DIMENSIONS = [
  'Technical Accuracy',
  'Depth of Knowledge',
  'Practical Application',
  'Communication Clarity',
  'Problem Solving',
  'Senior-Level Thinking',
] as const;

/** Heuristic scoring when AI is unavailable */
export function calculateScores(answer: string): ScoreDimension[] {
  const length = answer.trim().length;
  const hasCode = /```|function|const |class /.test(answer);
  const hasTradeoffs = /trade-?off|however|because|consider/i.test(answer);
  const base = Math.min(10, 4 + length / 200);

  return DIMENSIONS.map((name, i) => {
    let score = base + (i % 3) * 0.3;
    if (hasCode && name.includes('Practical')) score += 1;
    if (hasTradeoffs && name.includes('Senior')) score += 1.2;
    if (length > 400 && name.includes('Depth')) score += 0.8;
    return { name, score: Math.min(10, Math.round(score * 10) / 10), maxScore: 10 };
  });
}
