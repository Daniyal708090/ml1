import type { InterviewMode, InterviewTrack } from './types';

export function toApiTrack(track: InterviewTrack): string {
  const map: Record<InterviewTrack, string> = {
    frontend: 'FRONTEND',
    backend: 'BACKEND',
    fullstack: 'FULLSTACK',
  };
  return map[track];
}

export function toApiMode(mode: InterviewMode): string {
  const map: Record<InterviewMode, string> = {
    practice: 'PRACTICE',
    analysis: 'ANALYSIS',
    'question-bank': 'QUESTION_BANK',
    'deep-dive': 'DEEP_DIVE',
    'weak-spot': 'WEAK_SPOT',
    'dream-job': 'DREAM_JOB',
  };
  return map[mode];
}
