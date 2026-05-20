import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, TrendingUp, Award, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockProgress, mockInterviews } from '@/lib/mockData';
import { formatDate, getSeniorityColor } from '@/lib/utils';

interface DashboardProps {
  onNavigate: (path: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const stats = [
    {
      label: 'Total Interviews',
      value: mockProgress.totalInterviews,
      icon: Calendar,
      color: 'from-violet-500 to-indigo-500',
    },
    {
      label: 'Average Score',
      value: mockProgress.averageScore.toFixed(1),
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Current Level',
      value: mockProgress.seniorityLevel,
      icon: Award,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Welcome back, Alex</h1>
        <p className="text-white/60 text-lg">Ready to level up your interview skills?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card glass>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/60 text-sm mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                  >
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card glass>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Start New Interview</h2>
          <p className="text-white/60">Choose your interview mode and begin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              mode: 'Practice Mode',
              desc: 'General practice with random questions',
              track: 'frontend',
            },
            {
              mode: 'Dream Job Mode',
              desc: 'Simulate interviews at target companies',
              track: 'frontend',
            },
            {
              mode: 'Weak Spot Mode',
              desc: 'Focus on your weakest topics',
              track: 'frontend',
            },
            {
              mode: 'Deep Dive Mode',
              desc: 'Advanced questions on specific topics',
              track: 'frontend',
            },
            {
              mode: 'Analysis Mode',
              desc: 'Get detailed feedback on each answer',
              track: 'frontend',
            },
            {
              mode: 'Question Bank',
              desc: 'Browse and practice specific questions',
              track: 'frontend',
            },
          ].map((mode, idx) => (
            <motion.div
              key={mode.mode}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200 cursor-pointer"
              onClick={() => onNavigate('/interview')}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-white">{mode.mode}</h3>
                <Play size={20} className="text-violet-400" />
              </div>
              <p className="text-sm text-white/60">{mode.desc}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      <Card glass>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Recent Interviews</h2>
          <p className="text-white/60">Your latest practice sessions</p>
        </div>

        <div className="space-y-4">
          {mockInterviews.map((interview) => (
            <div
              key={interview.id}
              className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Badge
                    className={getSeniorityColor(
                      interview.seniorityLevel || 'mid'
                    )}
                  >
                    {interview.seniorityLevel || 'In Progress'}
                  </Badge>
                  <Badge>{interview.track}</Badge>
                  <Badge>{interview.mode}</Badge>
                </div>
                <span className="text-sm text-white/60">
                  {formatDate(interview.startedAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">
                    {interview.questions.length} questions
                  </p>
                  {interview.overallScore && (
                    <p className="text-sm text-white/60">
                      Score: {interview.overallScore.toFixed(1)}/10
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('/results')}
                >
                  View Results
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card glass>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-white mb-2">Strong Topics</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {mockProgress.strongTopics.map((topic) => (
            <Badge key={topic} variant="success">
              {topic}
            </Badge>
          ))}
        </div>

        <div className="mt-6 mb-4">
          <h2 className="text-2xl font-bold text-white mb-2">Areas to Improve</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {mockProgress.weakTopics.map((topic) => (
            <Badge key={topic} variant="warning">
              {topic}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}

