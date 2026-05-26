import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { getDailyProgress, generateDailyMissions } from '@/services/gamification';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import type { DailyProgress, MissionProgress } from '@/types/gamification';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function MissionsPage() {
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMissions() {
      if (!profile?.uid) return;
      try {
        setLoading(true);
        const prog = await getDailyProgress(profile.uid);
        setDailyProgress(prog);
      } catch (err) {
        console.error('Failed to load daily progress:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMissions();
  }, [profile?.uid]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-400">Please sign in to view missions.</p>
      </div>
    );
  }

  // Get current active missions list
  const missionsList: MissionProgress[] = dailyProgress?.missions ?? generateDailyMissions().map((m) => ({
    missionId: m.id,
    type: m.type,
    title: m.title,
    target: m.target,
    current: 0,
    completed: false,
    xpReward: m.xpReward,
  }));

  const totalCompleted = missionsList.filter((m) => m.completed).length;
  const totalMissions = missionsList.length;
  const totalPercentage = totalMissions > 0 ? (totalCompleted / totalMissions) * 100 : 0;

  // Icon mapping
  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'questions': return '📝';
      case 'words': return '📚';
      case 'minutes': return '⏱️';
      case 'listening': return '🎧';
      default: return '🎯';
    }
  };

  // Path mapping
  const getMissionPath = (type: string) => {
    switch (type) {
      case 'questions': return '/study';
      case 'words': return '/study/vocabulary';
      case 'minutes': return '/study';
      case 'listening': return '/study/listening';
      default: return '/study';
    }
  };

  return (
    <div className="space-y-6 pb-8 text-slate-800 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
            Today&apos;s Missions
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Complete daily study goals to earn bonus XP and maintain your streak
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="p-6 bg-white border border-slate-200/60 space-y-4 shadow-sm">
        <div className="flex items-center justify-between font-bold text-sm">
          <h2 className="text-slate-800">Daily Accomplishment</h2>
          <span className="text-[#0071E3]">{totalCompleted} of {totalMissions} Completed</span>
        </div>
        <Progress value={totalPercentage} height="lg" />
        <p className="text-center text-xs text-slate-500">
          {totalCompleted === totalMissions
            ? '🎉 Outstanding! You\'ve completed all daily study challenges!'
            : `${totalMissions - totalCompleted} challenges left to finish today`}
        </p>
      </Card>

      {/* Streak Booster Card */}
      <Card className="relative overflow-hidden p-5 border border-amber-200/60 bg-amber-50/40 shadow-sm">
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-xl shadow-md">
            🔥
          </div>
          <div>
            <p className="text-base font-bold text-slate-900">Active Streak: {profile.currentStreak} Days</p>
            <p className="text-xs text-slate-500">
              Complete any study session of 10+ questions or minutes to maintain your streak today!
            </p>
          </div>
        </div>
      </Card>

      {/* Mission Cards */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {missionsList.map((mission) => {
            const pct = Math.min((mission.current / mission.target) * 100, 100);
            return (
              <motion.div
                key={mission.missionId}
                variants={itemVariants}
                onClick={() => {
                  if (!mission.completed) {
                    navigate(getMissionPath(mission.type));
                  }
                }}
                className={`rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
                  mission.completed
                    ? 'border-emerald-200/60 bg-emerald-50/40 cursor-default'
                    : 'border-slate-200/60 bg-white hover:bg-slate-50/80 hover:border-blue-400 hover:shadow-md cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-lg font-bold ${
                      mission.completed
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {mission.completed ? '✓' : getMissionIcon(mission.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-sm font-bold ${
                          mission.completed ? 'text-emerald-700 line-through' : 'text-slate-800'
                        }`}
                      >
                        {mission.title}
                      </h3>
                      <Badge variant="purple" className="text-[10px] font-bold">
                        +{mission.xpReward} XP
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Progress value={pct} height="sm" />
                      </div>
                      <span className="shrink-0 text-xs font-bold tabular-nums text-slate-500">
                        {mission.current} / {mission.target}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Available Rewards */}
      <div className="text-center text-xs text-slate-500">
        Total daily rewards available today:{' '}
        <span className="font-bold text-[#0071E3]">
          {missionsList.reduce((sum, m) => sum + m.xpReward, 0)} XP
        </span>
      </div>
    </div>
  );
}

