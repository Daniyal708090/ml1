import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Target, Award, Flame } from 'lucide-react';

const achievements = [
  {
    id: 1,
    title: 'First Interview',
    description: 'Complete your first practice interview',
    icon: Trophy,
    unlocked: true,
    progress: 100,
    color: 'from-yellow-500 to-orange-500',
  },
  {
    id: 2,
    title: 'Perfect Score',
    description: 'Score 10/10 on any question',
    icon: Star,
    unlocked: false,
    progress: 85,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    title: 'Week Streak',
    description: 'Practice 7 days in a row',
    icon: Flame,
    unlocked: true,
    progress: 100,
    color: 'from-red-500 to-orange-500',
  },
  {
    id: 4,
    title: 'Speed Demon',
    description: 'Answer 5 questions in under 10 minutes',
    icon: Zap,
    unlocked: false,
    progress: 60,
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 5,
    title: 'Topic Master',
    description: 'Score 9+ on all topics',
    icon: Award,
    unlocked: false,
    progress: 45,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 6,
    title: 'Sharpshooter',
    description: 'Complete 50 interviews',
    icon: Target,
    unlocked: false,
    progress: 24,
    color: 'from-violet-500 to-indigo-500',
  },
];

const milestones = [
  { count: 10, label: 'Interviews', unlocked: true },
  { count: 25, label: 'Interviews', unlocked: false },
  { count: 50, label: 'Interviews', unlocked: false },
  { count: 100, label: 'Interviews', unlocked: false },
];

export function Achievements() {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Achievements</h1>
        <p className="text-white/60 text-lg">
          {unlockedCount} of {achievements.length} unlocked
        </p>
      </div>

      <Card glass>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Progress</h2>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(unlockedCount / achievements.length) * 100}%`,
              }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-600"
            />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement, idx) => {
          const Icon = achievement.icon;
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card
                glass
                hover
                className={
                  achievement.unlocked ? '' : 'opacity-60 grayscale'
                }
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-16 h-16 rounded-lg bg-gradient-to-br ${achievement.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className="text-white" size={32} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-white truncate">
                        {achievement.title}
                      </h3>
                      {achievement.unlocked && (
                        <Badge variant="success">Unlocked</Badge>
                      )}
                    </div>
                    <p className="text-sm text-white/60 mb-3">
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && (
                      <div>
                        <div className="flex items-center justify-between text-xs text-white/60 mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${achievement.color}`}
                            style={{ width: `${achievement.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card glass>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Milestones</h2>
          <p className="text-white/60">Major achievements on your journey</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {milestones.map((milestone, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className={`p-6 rounded-lg border text-center ${
                milestone.unlocked
                  ? 'bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border-violet-500/30'
                  : 'bg-white/5 border-white/10 opacity-60'
              }`}
            >
              <div className="text-3xl font-bold text-white mb-1">
                {milestone.count}
              </div>
              <div className="text-sm text-white/60">{milestone.label}</div>
              {milestone.unlocked && (
                <Trophy className="mx-auto mt-2 text-yellow-400" size={20} />
              )}
            </motion.div>
          ))}
        </div>
      </Card>

      <Card glass>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Badges</h2>
          <p className="text-white/60">Earn badges by mastering topics</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'React Master', unlocked: true },
            { name: 'JS Expert', unlocked: true },
            { name: 'TypeScript Pro', unlocked: false },
            { name: 'Performance Guru', unlocked: false },
          ].map((badge, idx) => (
            <motion.div
              key={badge.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              className={`p-4 rounded-lg border text-center ${
                badge.unlocked
                  ? 'bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30'
                  : 'bg-white/5 border-white/10 opacity-60'
              }`}
            >
              <Award
                className={`mx-auto mb-2 ${badge.unlocked ? 'text-green-400' : 'text-white/40'}`}
                size={32}
              />
              <div className="text-sm font-medium text-white">{badge.name}</div>
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  );
}

