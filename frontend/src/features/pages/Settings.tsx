import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Bell, Shield, Palette, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockUser, companies } from '@/lib/mockData';

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/60 text-lg">Customize your interview experience</p>
      </div>

      <Card glass>
        <div className="flex items-center gap-3 mb-6">
          <User className="text-violet-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Name
            </label>
            <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white">
              {mockUser.name}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Email
            </label>
            <div className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white">
              {mockUser.email}
            </div>
          </div>
        </div>
      </Card>

      <Card glass>
        <div className="flex items-center gap-3 mb-6">
          <Target className="text-violet-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Interview Preferences</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Preferred Track
            </label>
            <div className="flex gap-2">
              {['Frontend', 'Backend', 'Full-Stack'].map((track) => (
                <Badge
                  key={track}
                  variant={track === 'Frontend' ? 'success' : 'default'}
                >
                  {track}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Target Level
            </label>
            <div className="flex gap-2">
              {['Junior', 'Mid', 'Senior', 'Staff', 'Principal'].map((level) => (
                <Badge
                  key={level}
                  variant={level === 'Senior' ? 'success' : 'default'}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Target Companies
            </label>
            <div className="flex flex-wrap gap-2">
              {mockUser.targetCompanies.map((company) => (
                <Badge key={company} variant="info">
                  {company}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card glass>
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-violet-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Notifications</h2>
        </div>
        <div className="space-y-4">
          {[
            { label: 'Email notifications', enabled: true },
            { label: 'Progress updates', enabled: true },
            { label: 'New question alerts', enabled: false },
            { label: 'Weekly summary', enabled: true },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <span className="text-white font-medium">{item.label}</span>
              <div
                className={`w-12 h-6 rounded-full transition-all duration-200 ${
                  item.enabled ? 'bg-violet-600' : 'bg-white/20'
                } relative`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${
                    item.enabled ? 'left-7' : 'left-1'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      <Card glass>
        <div className="flex items-center gap-3 mb-6">
          <Palette className="text-violet-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Appearance</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Theme
            </label>
            <div className="flex gap-2">
              <Badge variant="success">Dark</Badge>
              <Badge>Light</Badge>
              <Badge>Auto</Badge>
            </div>
          </div>
        </div>
      </Card>

      <Card glass>
        <div className="flex items-center gap-3 mb-6">
          <Zap className="text-violet-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Advanced</h2>
        </div>
        <div className="space-y-3">
          <Button variant="secondary" className="w-full justify-start">
            Export Interview History
          </Button>
          <Button variant="secondary" className="w-full justify-start">
            Reset Progress
          </Button>
          <Button variant="danger" className="w-full justify-start">
            Delete Account
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Target({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

