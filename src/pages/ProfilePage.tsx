import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getRecentSessions } from '@/services/study';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { xpProgressInLevel } from '@/types/gamification';
import { formatTimestamp, formatDuration, getAccuracyColor } from '@/utils/helpers';
import type { StudySession } from '@/types/study';
import * as Icons from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfilePage() {
  const { profile } = useAuthStore();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      if (!profile?.uid) return;
      try {
        const data = await getRecentSessions(profile.uid, 5);
        setSessions(data);
      } catch (err) {
        console.error('Failed to load sessions:', err);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, [profile?.uid]);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-400">Please sign in to view your profile.</p>
      </div>
    );
  }

  const { current, required, percentage } = xpProgressInLevel(profile.xp);
  const accuracy = profile.totalQuestionsAnswered > 0
    ? Math.round((profile.totalCorrectAnswers / profile.totalQuestionsAnswered) * 100)
    : 0;

  // Static badge milestones
  const achievements = [
    {
      title: 'First Step',
      desc: 'Completed your first study session',
      icon: '🌱',
      unlocked: profile.totalQuestionsAnswered > 0,
    },
    {
      title: 'Streak Starter',
      desc: 'Maintain a 3-day study streak',
      icon: '🔥',
      unlocked: profile.longestStreak >= 3,
    },
    {
      title: 'Accuracy Elite',
      desc: 'Achieve >85% accuracy in a session',
      icon: '🎯',
      unlocked: accuracy >= 85 && profile.totalQuestionsAnswered > 0,
    },
    {
      title: 'Word Wizard',
      desc: 'Learn 50 vocabulary words',
      icon: '📚',
      unlocked: profile.vocabularyLearned >= 50,
    },
    {
      title: 'Dedicated Scholar',
      desc: 'Study for more than 120 minutes',
      icon: '⏱️',
      unlocked: profile.totalStudyMinutes >= 120,
    },
    {
      title: 'TOEIC Challenger',
      desc: 'Answered over 100 questions',
      icon: '🏆',
      unlocked: profile.totalQuestionsAnswered >= 100,
    },
  ];

  return (
    <div className="space-y-8 pb-8 text-slate-800">
      {/* Profile Header Card */}
      <Card className="p-6 md:p-8 relative overflow-hidden bg-white border border-slate-200/60 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
          <Avatar
            fallback={profile.avatarUrl && !profile.avatarUrl.includes('/') ? profile.avatarUrl : undefined}
            src={profile.avatarUrl && profile.avatarUrl.includes('/') ? profile.avatarUrl : undefined}
            alt={profile.displayName}
            size="xl"
            className="ring-4 ring-slate-100"
          />
          <div className="flex-1 space-y-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 className="text-3xl font-black tracking-tight text-slate-900">{profile.displayName}</h1>
              <Badge variant="purple" className="px-3 py-1 font-bold">
                Level {profile.level}
              </Badge>
              {profile.role === 'admin' && (
                <Badge variant="info" className="px-3 py-1 font-bold bg-teal-50 text-teal-700 border-teal-200">
                  Admin
                </Badge>
              )}
            </div>

            <p className="text-slate-500 text-sm">{profile.email}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                📅 Member since: <span className="text-slate-700">{formatTimestamp(profile.createdAt)}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                🎯 Target Score: <span className="text-[#0071E3] font-bold">{profile.targetScore} ({profile.targetExam.toUpperCase()})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-8 pt-6 border-t border-slate-150 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span>Level {profile.level}</span>
            <span>{current.toLocaleString()} / {required.toLocaleString()} XP to Level {profile.level + 1}</span>
          </div>
          <Progress value={percentage} height="md" />
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total XP', value: profile.xp.toLocaleString(), color: 'text-[#0071E3]', icon: Icons.Award },
          { label: 'Current Streak', value: `${profile.currentStreak} days`, color: 'text-amber-600', icon: Icons.Flame },
          { label: 'Longest Streak', value: `${profile.longestStreak} days`, color: 'text-orange-600', icon: Icons.TrendingUp },
          { label: 'Average Accuracy', value: `${accuracy}%`, color: getAccuracyColor(accuracy), icon: Icons.Percent },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="p-5 flex flex-col justify-between bg-white border border-slate-200/60 hover:border-slate-300 transition-colors shadow-sm">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                <Icon className="w-4 h-4" />
              </div>
              <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Recent History & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Achievements */}
          <Card className="p-6 bg-white border border-slate-200/60 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Icons.Shield className="w-5 h-5 text-[#0071E3]" />
              Achievements
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((ach, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                    ach.unlocked
                      ? 'bg-blue-50/50 border-blue-100'
                      : 'bg-slate-50/40 border-slate-200/40 opacity-50'
                  }`}
                >
                  <span className="text-2xl">{ach.icon}</span>
                  <div>
                    <p className={`text-sm font-semibold ${ach.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                      {ach.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent History */}
          <Card className="p-6 bg-white border border-slate-200/60 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Icons.History className="w-5 h-5 text-[#0071E3]" />
              Recent Sessions
            </h2>

            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No recent study sessions. Click Study to start learning!
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-slate-200/60 bg-white hover:bg-slate-50 transition-colors gap-3 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            session.type === 'listening'
                              ? 'info'
                              : session.type === 'vocabulary'
                              ? 'purple'
                              : 'default'
                          }
                          className="capitalize text-[10px] font-bold"
                        >
                          {session.type}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-600">
                          {session.questionsAttempted} questions
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatTimestamp(session.createdAt as any)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold self-end sm:self-center">
                      <span className="text-slate-500">
                        ⏱️ {formatDuration(session.totalSeconds)}
                      </span>
                      <span className={getAccuracyColor(session.accuracy)}>
                        🎯 {session.accuracy}%
                      </span>
                      <span className="text-emerald-650 font-extrabold text-sm">
                        +{session.xpEarned} XP
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right col: Stats Breakdowns */}
        <div className="space-y-6">
          <Card className="p-6 bg-white border border-slate-200/60 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Icons.Flame className="w-5 h-5 text-amber-500" />
              Consistency
            </h2>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Study Time</p>
                <p className="text-lg font-black text-slate-800 mt-1">
                  {profile.totalStudyMinutes} <span className="text-xs font-medium text-slate-500">mins</span>
                </p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Vocab Learner</p>
                <p className="text-lg font-black text-slate-800 mt-1">
                  {profile.vocabularyLearned} <span className="text-xs font-medium text-slate-500">words</span>
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50/40 border border-blue-100 rounded-xl space-y-2 text-xs">
              <p className="font-semibold text-[#0071E3]">Daily Study Goal</p>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                <span>{profile.totalStudyMinutes} / {profile.dailyGoalMinutes} mins</span>
                <span>{Math.min(Math.round((profile.totalStudyMinutes / profile.dailyGoalMinutes) * 100), 100)}%</span>
              </div>
              <Progress
                value={Math.min((profile.totalStudyMinutes / profile.dailyGoalMinutes) * 100, 100)}
                height="sm"
                className="bg-slate-100"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
