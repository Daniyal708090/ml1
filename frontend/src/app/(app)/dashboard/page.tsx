'use client';

import { Dashboard } from '@/features/pages/Dashboard';
import { useAppNavigate } from '@/components/PageNav';

export default function DashboardPage() {
  const onNavigate = useAppNavigate();
  return <Dashboard onNavigate={onNavigate} />;
}
