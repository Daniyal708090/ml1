'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Company {
  id: string;
  name: string;
  slug: string;
  focusAreas: string[];
}

interface CompanySelectorProps {
  value?: string;
  onChange: (companyId: string | undefined) => void;
}

export function CompanySelector({ value, onChange }: CompanySelectorProps) {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    api.companies().then((data) => setCompanies(data as Company[])).catch(() => {
      setCompanies([
        { id: '1', name: 'Google', slug: 'google', focusAreas: ['Algorithms'] },
        { id: '2', name: 'Stripe', slug: 'stripe', focusAreas: ['APIs'] },
        { id: '3', name: 'Vercel', slug: 'vercel', focusAreas: ['Next.js'] },
      ]);
    });
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      <label className="flex items-center gap-2 text-sm font-medium text-white/70">
        <Building2 className="h-4 w-4" />
        Company simulation
      </label>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className={cn(
            'rounded-lg border px-3 py-1.5 text-sm transition-colors',
            !value
              ? 'border-violet-500/50 bg-violet-500/20 text-white'
              : 'border-white/10 text-white/60 hover:bg-white/5'
          )}
        >
          General
        </button>
        {companies.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm transition-colors',
              value === c.id
                ? 'border-violet-500/50 bg-violet-500/20 text-white'
                : 'border-white/10 text-white/60 hover:bg-white/5'
            )}
          >
            {c.name}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
