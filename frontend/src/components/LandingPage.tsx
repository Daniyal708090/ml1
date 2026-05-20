'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Trophy, TrendingUp } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-black via-zinc-900 to-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-600/20 via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mx-auto max-w-4xl px-6 text-center"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-600/20 px-4 py-2">
          <Sparkles size={16} className="text-violet-400" />
          <span className="text-sm font-medium text-violet-300">AI-Powered Interview Training</span>
        </div>

        <h1 className="mb-6 bg-gradient-to-r from-white via-violet-200 to-indigo-200 bg-clip-text text-5xl font-bold text-transparent md:text-7xl">
          Master Technical
          <br />
          Interviews
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-xl text-white/60">
          Practice with an AI interviewer that simulates FAANG-level interviews. Get instant
          feedback, detailed analysis, and personalized coaching.
        </p>

        <div className="mb-12 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg">Get Started Free</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary">
              View Demo
            </Button>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { icon: Zap, title: 'Real-Time Analysis', description: 'Instant feedback on every answer' },
            { icon: Trophy, title: 'FAANG Simulation', description: 'Company-specific interview modes' },
            { icon: TrendingUp, title: 'Progress Tracking', description: 'Heatmaps and score history' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
              >
                <Icon className="mx-auto mb-3 h-8 w-8 text-violet-400" />
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm text-white/60">{f.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
