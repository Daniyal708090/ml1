import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Award, Target } from 'lucide-react';
import { mockProgress } from '@/lib/mockData';
import { format } from 'date-fns';
import { getSeniorityColor } from '@/lib/utils';

export function ProgressTracker() {
  const scoreData = mockProgress.scoreHistory.map((item) => ({
    date: format(item.date, 'MMM dd'),
    score: item.score,
  }));

  const topicData = mockProgress.topicScores;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Progress Tracker</h1>
        <p className="text-white/60 text-lg">
          Track your improvement over time
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card glass>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Total Interviews</p>
                <p className="text-3xl font-bold text-white">
                  {mockProgress.totalInterviews}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                <Target className="text-white" size={24} />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card glass>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Average Score</p>
                <p className="text-3xl font-bold text-white">
                  {mockProgress.averageScore.toFixed(1)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp size={16} className="text-green-400" />
                  <span className="text-sm text-green-400">+1.2 this week</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="text-white" size={24} />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card glass>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-white/60 text-sm mb-1">Current Level</p>
                <Badge className={getSeniorityColor(mockProgress.seniorityLevel)}>
                  {mockProgress.seniorityLevel.toUpperCase()}
                </Badge>
                <p className="text-sm text-white/60 mt-2">
                  Next: Staff Engineer
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Award className="text-white" size={24} />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <Card glass>
        <h2 className="text-2xl font-bold text-white mb-6">Score History</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={scoreData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="date"
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
              domain={[0, 10]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="url(#colorGradient)"
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 6 }}
              activeDot={{ r: 8 }}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card glass>
        <h2 className="text-2xl font-bold text-white mb-6">Topic Scores</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topicData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              type="number"
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
              domain={[0, 10]}
            />
            <YAxis
              type="category"
              dataKey="topic"
              stroke="rgba(255,255,255,0.5)"
              style={{ fontSize: '12px' }}
              width={120}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: 'white',
              }}
            />
            <Bar dataKey="score" radius={[0, 8, 8, 0]}>
              {topicData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.score >= 8
                      ? '#10b981'
                      : entry.score >= 6
                        ? '#facc15'
                        : '#f97316'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card glass>
          <h2 className="text-2xl font-bold text-white mb-4">Strong Topics</h2>
          <div className="space-y-3">
            {mockProgress.strongTopics.map((topic, idx) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-green-400/10 border border-green-400/20"
              >
                <span className="text-white font-medium">{topic}</span>
                <Badge variant="success">Strong</Badge>
              </motion.div>
            ))}
          </div>
        </Card>

        <Card glass>
          <h2 className="text-2xl font-bold text-white mb-4">Areas to Improve</h2>
          <div className="space-y-3">
            {mockProgress.weakTopics.map((topic, idx) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="flex items-center justify-between p-3 rounded-lg bg-orange-400/10 border border-orange-400/20"
              >
                <span className="text-white font-medium">{topic}</span>
                <Badge variant="warning">Needs Work</Badge>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      <Card glass>
        <h2 className="text-2xl font-bold text-white mb-4">Improvement Recommendations</h2>
        <div className="space-y-3">
          {[
            'Focus on System Design patterns - practice designing scalable architectures',
            'Deepen Security knowledge - study OWASP Top 10 and common vulnerabilities',
            'Improve Testing skills - learn advanced testing patterns and best practices',
          ].map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + idx * 0.1 }}
              className="p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <p className="text-white/90">{rec}</p>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

