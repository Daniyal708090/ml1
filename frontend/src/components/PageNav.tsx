'use client';

import { useRouter } from 'next/navigation';

export function useAppNavigate() {
  const router = useRouter();
  return (path: string) => router.push(path);
}
