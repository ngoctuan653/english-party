import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getDailyProgress, generateDailyMissions } from '@/services/gamification';
import { db } from '@/services/firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { getRecentSessions } from '@/services/study';
import SessionReviewModal from '@/components/study/SessionReviewModal';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { getTodayDateString } from '@/utils/helpers';
import type { DailyProgress } from '@/types/gamification';
import type { UserProfile } from '@/types/user';
import type { StudySession } from '@/types/study';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviewSession, setSelectedReviewSession] = useState<StudySession | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      if (!profile?.uid) return;
      try {
        setLoading(true);
        // 1. Fetch daily progress
        const prog = await getDailyProgress(profile.uid);
        setDailyProgress(prog);

        // 2. Fetch top 10 leaderboard
        const usersSnap = await getDocs(
          query(collection(db, 'users'), orderBy('xp', 'desc'), limit(10))
        );
        const topUsers: UserProfile[] = [];
        usersSnap.forEach((doc) => {
          topUsers.push({ uid: doc.id, ...doc.data() } as UserProfile);
        });
        setLeaderboard(topUsers);

        // 3. Fetch recent study sessions
        const sessions = await getRecentSessions(profile.uid, 5);
        setRecentSessions(sessions);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [profile?.uid]);

  const displayName = profile?.displayName ?? 'Student';

  // Stats configs
  const stats = [
    {
      label: 'Streak',
      value: `${profile?.currentStreak ?? 0} days`,
      icon: '🔥',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      label: 'Total XP',
      value: `${(profile?.xp ?? 0).toLocaleString()} XP`,
      icon: '⚡',
      gradient: 'from-violet-500 to-purple-500',
    },
    {
      label: "Today's Questions",
      value: dailyProgress?.questionsCompleted ?? 0,
      icon: '📝',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Active Study',
      value: `${dailyProgress?.activeMinutes ?? 0} min`,
      icon: '⏱️',
      gradient: 'from-teal-500 to-emerald-500',
    },
  ];

  // Get active missions (either from progress or templates)
  const todayMissions = dailyProgress?.missions ?? generateDailyMissions().map((m) => ({
    missionId: m.id,
    type: m.type,
    title: m.title,
    target: m.target,
    current: 0,
    completed: false,
    xpReward: m.xpReward,
  }));

  // Pad leaderboard to 3 for podium display
  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="space-y-6 pb-8 text-slate-800">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
          Welcome back,{' '}
          <span className="bg-gradient-to-r from-blue-600 to-[#0071E3] bg-clip-text text-transparent">
            {displayName}
          </span>
          ! 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">
          Ready to achieve your target TOEIC score today?
        </p>
      </div>

      {/* ═══════════════ LEADERBOARD — FULL WIDTH, TOP ═══════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70"
      >
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-500 ring-1 ring-amber-100">
              <Icons.Award className="h-5 w-5" />
            </span>
            Leaderboard
          </h2>
          <Link to="/leaderboard" className="text-xs font-bold text-[#0071E3] transition-colors hover:text-blue-700">
            Full Standings →
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-40 w-full rounded-xl bg-slate-100" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="relative z-10 flex flex-col items-center justify-center py-12 text-sm text-slate-400">
            <Icons.Trophy className="mb-3 h-10 w-10 text-amber-300" />
            <p className="font-medium text-slate-500">No players yet. Be the first!</p>
          </div>
        ) : (
          <div className="relative z-10">
            {/* ── PODIUM SECTION ── */}
            <div className="bg-gradient-to-b from-white to-slate-50 px-4 pb-0 pt-5 sm:px-8 sm:pt-6">
              <div className="flex items-end justify-center gap-3 sm:gap-8 md:gap-14">
                {/* 2nd place (left, medium height) */}
                {top3.length >= 2 && (
                  <div className="flex max-w-[120px] flex-1 flex-col items-center">
                    <div className="relative">
                      <Avatar
                        fallback={top3[1].avatarUrl && !top3[1].avatarUrl.includes('/') ? top3[1].avatarUrl : undefined}
                        src={top3[1].avatarUrl && top3[1].avatarUrl.includes('/') ? top3[1].avatarUrl : undefined}
                        alt={top3[1].displayName}
                        size="lg"
                        className="rounded-full ring-4 ring-white shadow-md shadow-slate-200"
                      />
                      {top3[1].uid === profile?.uid && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#0071E3] px-1.5 py-0.5 text-[8px] font-extrabold text-white shadow-sm">YOU</span>
                      )}
                    </div>
                    <p className="mt-2 max-w-[88px] truncate text-center text-[11px] font-bold text-slate-700">{top3[1].displayName}</p>
                    <p className="text-[10px] font-semibold tabular-nums text-slate-400">{top3[1].xp.toLocaleString()} XP</p>
                    {/* Silver podium block */}
                    <div className="relative mt-3 flex h-20 w-full items-center justify-center rounded-t-xl bg-gradient-to-b from-slate-200 to-slate-400 shadow-lg shadow-slate-300/40 sm:h-24">
                      <span className="absolute top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[10px] font-black text-slate-500 ring-1 ring-white">2</span>
                      <span className="text-3xl font-black text-white/90 sm:text-4xl">2</span>
                    </div>
                  </div>
                )}

                {/* 1st place (center, tallest) */}
                {top3.length >= 1 && (
                  <div className="flex max-w-[140px] flex-1 flex-col items-center">
                    <motion.div
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                      className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-500 shadow-sm ring-1 ring-amber-100 sm:h-10 sm:w-10"
                    >
                      <Icons.Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
                    </motion.div>
                    <div className="relative">
                      <Avatar
                        fallback={top3[0].avatarUrl && !top3[0].avatarUrl.includes('/') ? top3[0].avatarUrl : undefined}
                        src={top3[0].avatarUrl && top3[0].avatarUrl.includes('/') ? top3[0].avatarUrl : undefined}
                        alt={top3[0].displayName}
                        size="xl"
                        className="rounded-full ring-4 ring-amber-300 shadow-lg shadow-amber-200/70"
                      />
                      {top3[0].uid === profile?.uid && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#0071E3] px-1.5 py-0.5 text-[8px] font-extrabold text-white shadow-sm">YOU</span>
                      )}
                    </div>
                    <p className="mt-2 max-w-[108px] truncate text-center text-sm font-extrabold text-slate-900">{top3[0].displayName}</p>
                    <p className="text-xs font-bold tabular-nums text-amber-600">{top3[0].xp.toLocaleString()} XP</p>
                    {/* Gold podium block */}
                    <div className="relative mt-3 flex h-28 w-full items-center justify-center rounded-t-xl bg-gradient-to-b from-[#FFD95A] to-[#E19A16] shadow-xl shadow-amber-300/50 sm:h-32">
                      <span className="absolute top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-xs font-black text-amber-600 ring-1 ring-white">1</span>
                      <span className="text-4xl font-black text-white sm:text-5xl">1</span>
                    </div>
                  </div>
                )}

                {/* 3rd place (right, shortest) */}
                {top3.length >= 3 && (
                  <div className="flex max-w-[120px] flex-1 flex-col items-center">
                    <div className="relative">
                      <Avatar
                        fallback={top3[2].avatarUrl && !top3[2].avatarUrl.includes('/') ? top3[2].avatarUrl : undefined}
                        src={top3[2].avatarUrl && top3[2].avatarUrl.includes('/') ? top3[2].avatarUrl : undefined}
                        alt={top3[2].displayName}
                        size="lg"
                        className="rounded-full ring-4 ring-white shadow-md shadow-slate-200"
                      />
                      {top3[2].uid === profile?.uid && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#0071E3] px-1.5 py-0.5 text-[8px] font-extrabold text-white shadow-sm">YOU</span>
                      )}
                    </div>
                    <p className="mt-2 max-w-[88px] truncate text-center text-[11px] font-bold text-slate-700">{top3[2].displayName}</p>
                    <p className="text-[10px] font-semibold tabular-nums text-slate-400">{top3[2].xp.toLocaleString()} XP</p>
                    {/* Bronze podium block */}
                    <div className="relative mt-3 flex h-16 w-full items-center justify-center rounded-t-xl bg-gradient-to-b from-[#D99567] to-[#B56A3E] shadow-lg shadow-orange-200/50">
                      <span className="absolute top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[10px] font-black text-orange-700 ring-1 ring-white">3</span>
                      <span className="text-2xl font-black text-white/90 sm:text-3xl">3</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── REMAINING USERS LIST ── */}
            {rest.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
                {rest.map((user, idx) => (
                  <div
                    key={user.uid}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-xs transition-all ${
                      user.uid === profile?.uid
                        ? 'border-[#0071E3]/30 bg-blue-50 shadow-sm'
                        : 'border-slate-100 bg-slate-50/80 hover:border-slate-200 hover:bg-white'
                    }`}
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-500 ring-1 ring-slate-200">#{idx + 4}</span>
                    <Avatar
                      fallback={user.avatarUrl && !user.avatarUrl.includes('/') ? user.avatarUrl : undefined}
                      src={user.avatarUrl && user.avatarUrl.includes('/') ? user.avatarUrl : undefined}
                      alt={user.displayName}
                      size="xs"
                      className="rounded-full ring-2 ring-white"
                    />
                    <span className={`min-w-0 flex-1 truncate font-semibold ${user.uid === profile?.uid ? 'text-[#0071E3]' : 'text-slate-700'}`}>
                      {user.displayName}
                      {user.uid === profile?.uid && <span className="ml-1.5 rounded-full bg-[#0071E3] px-1 py-0.5 text-[8px] text-white">YOU</span>}
                    </span>
                    <span className="text-[10px] font-bold tabular-nums text-slate-500">
                      {user.xp.toLocaleString()} XP
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-slate-300/80 hover:shadow-md hover:shadow-slate-200/40"
          >
            <div
              className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-15`}
            />

            <div className="relative">
              <div className="mb-3 flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-lg shadow-sm text-white`}
                >
                  {stat.icon}
                </div>
                <span className="text-sm font-medium text-slate-500">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid - Missions + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Today's Missions */}
        <Card className="p-5 flex flex-col bg-white border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Icons.Target className="w-5 h-5 text-[#0071E3]" />
              Daily Missions
            </h2>
            <Link to="/missions" className="text-xs text-[#0071E3] hover:underline font-medium">View All</Link>
          </div>

          <div className="space-y-3.5 flex-1">
            {todayMissions.slice(0, 4).map((mission) => {
              const pct = Math.min((mission.current / mission.target) * 100, 100);
              return (
                <div
                  key={mission.missionId}
                  onClick={() => {
                    if (mission.title.includes('Words')) navigate('/vocabulary');
                    else if (mission.title.includes('Listening')) navigate('/listening');
                    else navigate('/study');
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                    mission.completed
                      ? 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50'
                      : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`text-xs font-semibold ${mission.completed ? 'text-emerald-700 line-through' : 'text-slate-800'}`}>
                      {mission.title}
                    </span>
                    <span className="text-[10px] font-extrabold text-[#0071E3] bg-[#0071E3]/10 px-1.5 py-0.5 rounded-full">
                      +{mission.xpReward} XP
                    </span>
                  </div>
                  <Progress value={pct} height="sm" />
                  <p className="mt-1 text-right text-[9px] font-semibold text-slate-400">
                    {mission.current} / {mission.target}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Session Log */}
        <Card className="p-5 flex flex-col bg-white border-slate-200">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-4">
            <Icons.History className="w-5 h-5 text-blue-500" />
            Recent Activity
          </h2>

          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs flex-1 flex items-center justify-center">
              No recent study activity.
            </div>
          ) : (
            <div className="space-y-2.5 flex-1 max-h-[280px] overflow-y-auto pr-0.5 scrollbar-thin">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => setSelectedReviewSession(session)}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 cursor-pointer hover:bg-slate-100/60 transition-colors"
                >
                  <span className="text-sm mt-0.5">
                    {session.type === 'listening' ? '🎧' : session.type === 'vocabulary' ? '📚' : '📝'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">
                      Completed {session.type === 'quiz' ? 'TOEIC MCQ' : session.type} quiz
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400 font-bold">
                      <span>{session.questionsAttempted} Qs</span>
                      <span>•</span>
                      <span className={session.accuracy >= 70 ? 'text-emerald-600' : 'text-slate-400'}>
                        {session.accuracy}% accuracy
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 text-right shrink-0">
                    +{session.xpEarned} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <SessionReviewModal
        isOpen={selectedReviewSession !== null}
        onClose={() => setSelectedReviewSession(null)}
        session={selectedReviewSession}
      />
    </div>
  );
}
