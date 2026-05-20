'use client';

import { AnalysisResults } from '@/features/pages/AnalysisResults';
import { useAppNavigate } from '@/components/PageNav';

export default function ResultsPage() {
  const onNavigate = useAppNavigate();
  return <AnalysisResults onNavigate={onNavigate} />;
}
