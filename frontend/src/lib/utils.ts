import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-400';
  if (score >= 6) return 'text-yellow-400';
  if (score >= 4) return 'text-orange-400';
  return 'text-red-400';
}

export function getHiringSignalColor(
  signal: 'hire' | 'lean-hire' | 'lean-no-hire' | 'no-hire'
): string {
  switch (signal) {
    case 'hire':
      return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'lean-hire':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
    case 'lean-no-hire':
      return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'no-hire':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
  }
}

export function getDifficultyColor(
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
): string {
  switch (difficulty) {
    case 'easy':
      return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'medium':
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
    case 'hard':
      return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'expert':
      return 'text-red-400 bg-red-400/10 border-red-400/20';
  }
}

export function getSeniorityColor(
  level: 'junior' | 'mid' | 'senior' | 'staff' | 'principal'
): string {
  switch (level) {
    case 'junior':
      return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'mid':
      return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20';
    case 'senior':
      return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    case 'staff':
      return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
    case 'principal':
      return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
  }
}
