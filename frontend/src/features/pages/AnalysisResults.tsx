import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  ChevronRight,
} from 'lucide-react';
import { mockAnalyses, frontendQuestions } from '@/lib/mockData';
import {
  getScoreColor,
  getHiringSignalColor,
  getSeniorityColor,
} from '@/lib/utils';

interface AnalysisResultsProps {
  onNavigate: (path: string) => void;
}

export function AnalysisResults({ onNavigate }: AnalysisResultsProps) {
  const analysis = mockAnalyses[0];
  const question = frontendQuestions.find((q) => q.id === analysis.questionId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Interview Analysis</h1>
          <p className="text-white/60 text-lg">Detailed feedback on your performance</p>
        </div>
        <Button onClick={() => onNavigate('/interview')}>Start New Interview</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card glass>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {analysis.overallScore.toFixed(1)}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Overall Score</h3>
              <p className="text-sm text-white/60">Out of 10</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card glass>
            <div className="text-center">
              <div className="mb-4">
                <Award className="w-12 h-12 mx-auto text-purple-400" />
              </div>
              <Badge className={getSeniorityColor(analysis.seniorityLevel)}>
                {analysis.seniorityLevel.toUpperCase()}
              </Badge>
              <h3 className="text-lg font-semibold text-white mt-2 mb-1">
                Seniority Level
              </h3>
              <p className="text-sm text-white/60">Current assessment</p>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card glass>
            <div className="text-center">
              <div className="mb-4">
                <Target className="w-12 h-12 mx-auto text-green-400" />
              </div>
              <Badge className={getHiringSignalColor(analysis.hiringSignal)}>
                {analysis.hiringSignal.toUpperCase().replace('-', ' ')}
              </Badge>
              <h3 className="text-lg font-semibold text-white mt-2 mb-1">
                Hiring Signal
              </h3>
              <p className="text-sm text-white/60">Interview outcome</p>
            </div>
          </Card>
        </motion.div>
      </div>

      <Card glass>
        <h2 className="text-2xl font-bold text-white mb-4">Question</h2>
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-white font-medium">{question?.text}</p>
          <div className="flex gap-2 mt-3">
            {question?.topics.map((topic) => (
              <Badge key={topic}>{topic}</Badge>
            ))}
          </div>
        </div>
      </Card>

      <Card glass>
        <h2 className="text-2xl font-bold text-white mb-6">Score Breakdown</h2>
        <div className="space-y-4">
          {analysis.scores.map((score, idx) => (
            <motion.div
              key={score.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{score.name}</span>
                <span className={`font-bold ${getScoreColor(score.score)}`}>
                  {score.score}/{score.maxScore}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(score.score / score.maxScore) * 100}%` }}
                  transition={{ delay: 0.5 + idx * 0.1, duration: 0.5 }}
                  className={`h-full bg-gradient-to-r ${
                    score.score >= 8
                      ? 'from-green-500 to-emerald-500'
                      : score.score >= 6
                        ? 'from-yellow-500 to-orange-500'
                        : 'from-orange-500 to-red-500'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card glass>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-green-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Strengths</h2>
          </div>
          <ul className="space-y-2">
            {analysis.strengths.map((strength, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="flex items-start gap-2 text-white/80"
              >
                <ChevronRight className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
                <span>{strength}</span>
              </motion.li>
            ))}
          </ul>
        </Card>

        <Card glass>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="text-orange-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Gaps & Blind Spots</h2>
          </div>
          <ul className="space-y-2">
            {analysis.gaps.map((gap, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
                className="flex items-start gap-2 text-white/80"
              >
                <ChevronRight className="text-orange-400 flex-shrink-0 mt-0.5" size={20} />
                <span>{gap}</span>
              </motion.li>
            ))}
          </ul>
        </Card>
      </div>

      <Card glass>
        <h2 className="text-2xl font-bold text-white mb-4">💡 Ideal Answer</h2>
        <div className="p-4 rounded-lg bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
          <p className="text-white/90 leading-relaxed">{analysis.idealAnswer}</p>
        </div>
      </Card>

      <Card glass>
        <h2 className="text-2xl font-bold text-white mb-4">🎯 Follow-Up Questions</h2>
        <div className="space-y-3">
          {analysis.followUpQuestions.map((question, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + idx * 0.1 }}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
            >
              <p className="text-white font-medium">{question}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      <Card glass>
        <h2 className="text-2xl font-bold text-white mb-4">🛠️ Coaching Advice</h2>
        <div className="space-y-2">
          {analysis.coachingAdvice.map((advice, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + idx * 0.1 }}
              className="flex items-start gap-2"
            >
              <ChevronRight className="text-violet-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-white/80">{advice}</p>
            </motion.div>
          ))}
        </div>
      </Card>

      <div className="flex gap-4">
        <Button onClick={() => onNavigate('/progress')} className="flex-1">
          View Progress Tracker
        </Button>
        <Button onClick={() => onNavigate('/dashboard')} variant="secondary" className="flex-1">
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}

