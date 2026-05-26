import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { getDailyProgress, generateDailyMissions } from '@/services/gamification';
import { db } from '@/services/firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
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
        const sessionsSnap = await getDocs(
          query(
            collection(db, 'study_sessions'),
            orderBy('createdAt', 'desc'),
            limit(5)
          )
        );
        const sessions: StudySession[] = [];
        sessionsSnap.forEach((doc) => {
          sessions.push({ id: doc.id, ...doc.data() } as StudySession);
        });
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
        className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f3460] shadow-xl"
      >
        {/* Background glow effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 w-80 h-80 bg-amber-400/8 rounded-full blur-3xl" />
          <div className="absolute right-0 bottom-0 w-48 h-48 bg-blue-500/8 rounded-full blur-3xl" />
        </div>

        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-5 pb-3 relative z-10">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Icons.Award className="w-5 h-5 text-amber-400" />
            Leaderboard
          </h2>
          <Link to="/leaderboard" className="text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors">
            Full Standings →
          </Link>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-40 w-full rounded-xl bg-white/10" />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/40 text-sm relative z-10">
            <span className="text-4xl mb-3">🏆</span>
            <p className="font-medium">No players yet. Be the first!</p>
          </div>
        ) : (
          <div className="relative z-10">
            {/* ── PODIUM SECTION ── */}
            <div className="px-4 sm:px-8 pt-2 pb-0">
              <div className="flex items-end justify-center gap-3 sm:gap-8 md:gap-12">
                {/* 2nd place (left, medium height) */}
                {top3.length >= 2 && (
                  <div className="flex flex-col items-center flex-1 max-w-[120px]">
                    <div className="relative">
                      <Avatar
                        fallback={top3[1].avatarUrl && !top3[1].avatarUrl.includes('/') ? top3[1].avatarUrl : undefined}
                        src={top3[1].avatarUrl && top3[1].avatarUrl.includes('/') ? top3[1].avatarUrl : undefined}
                        alt={top3[1].displayName}
                        size="lg"
                        className="ring-3 ring-slate-300/60"
                      />
                      {top3[1].uid === profile?.uid && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-extrabold bg-[#0071E3] text-white px-1.5 py-0.5 rounded-full">YOU</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] font-bold text-white/80 max-w-[80px] truncate text-center">{top3[1].displayName}</p>
                    <p className="text-[10px] tabular-nums font-semibold text-slate-400">{top3[1].xp.toLocaleString()} XP</p>
                    {/* Silver podium block */}
                    <div className="mt-2 w-full h-20 sm:h-24 bg-gradient-to-b from-[#C0C8D8] to-[#8A95A5] rounded-t-lg flex items-center justify-center shadow-lg shadow-slate-500/20 relative">
                      <span className="text-3xl sm:text-4xl font-black text-white/80">2</span>
                      <span className="absolute top-2 text-xl">🥈</span>
                    </div>
                  </div>
                )}

                {/* 1st place (center, tallest) */}
                {top3.length >= 1 && (
                  <div className="flex flex-col items-center flex-1 max-w-[140px]">
                    <motion.span
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                      className="text-3xl sm:text-4xl mb-1 drop-shadow-lg"
                    >
                      🏆
                    </motion.span>
                    <div className="relative">
                      <Avatar
                        fallback={top3[0].avatarUrl && !top3[0].avatarUrl.includes('/') ? top3[0].avatarUrl : undefined}
                        src={top3[0].avatarUrl && top3[0].avatarUrl.includes('/') ? top3[0].avatarUrl : undefined}
                        alt={top3[0].displayName}
                        size="xl"
                        className="ring-4 ring-amber-400/60"
                      />
                      {top3[0].uid === profile?.uid && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-extrabold bg-[#0071E3] text-white px-1.5 py-0.5 rounded-full">YOU</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-extrabold text-amber-300 max-w-[100px] truncate text-center">{top3[0].displayName}</p>
                    <p className="text-xs tabular-nums font-bold text-amber-400/80">{top3[0].xp.toLocaleString()} XP</p>
                    {/* Gold podium block */}
                    <div className="mt-2 w-full h-28 sm:h-32 bg-gradient-to-b from-[#F5C842] to-[#C97D10] rounded-t-lg flex items-center justify-center shadow-xl shadow-amber-500/30 relative">
                      <span className="text-4xl sm:text-5xl font-black text-white/90">1</span>
                      <span className="absolute top-2 text-xl">🥇</span>
                    </div>
                  </div>
                )}

                {/* 3rd place (right, shortest) */}
                {top3.length >= 3 && (
                  <div className="flex flex-col items-center flex-1 max-w-[120px]">
                    <div className="relative">
                      <Avatar
                        fallback={top3[2].avatarUrl && !top3[2].avatarUrl.includes('/') ? top3[2].avatarUrl : undefined}
                        src={top3[2].avatarUrl && top3[2].avatarUrl.includes('/') ? top3[2].avatarUrl : undefined}
                        alt={top3[2].displayName}
                        size="lg"
                        className="ring-3 ring-amber-700/40"
                      />
                      {top3[2].uid === profile?.uid && (
                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-extrabold bg-[#0071E3] text-white px-1.5 py-0.5 rounded-full">YOU</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[11px] font-bold text-white/70 max-w-[80px] truncate text-center">{top3[2].displayName}</p>
                    <p className="text-[10px] tabular-nums font-semibold text-slate-400">{top3[2].xp.toLocaleString()} XP</p>
                    {/* Bronze podium block */}
                    <div className="mt-2 w-full h-14 sm:h-18 bg-gradient-to-b from-[#D4845A] to-[#A05A30] rounded-t-lg flex items-center justify-center shadow-lg shadow-amber-800/20 relative">
                      <span className="text-2xl sm:text-3xl font-black text-white/80">3</span>
                      <span className="absolute top-1.5 text-lg">🥉</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── REMAINING USERS LIST ── */}
            {rest.length > 0 && (
              <div className="px-4 sm:px-6 py-3 space-y-1.5 border-t border-white/5 mt-3 bg-black/10">
                {rest.map((user, idx) => (
                  <div
                    key={user.uid}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors ${
                      user.uid === profile?.uid
                        ? 'bg-[#0071E3]/15 border border-[#0071E3]/30'
                        : 'bg-white/5 border border-white/5 hover:bg-white/8'
                    }`}
                  >
                    <span className="w-6 text-center font-bold text-slate-400 text-[11px]">#{idx + 4}</span>
                    <Avatar
                      fallback={user.avatarUrl && !user.avatarUrl.includes('/') ? user.avatarUrl : undefined}
                      src={user.avatarUrl && user.avatarUrl.includes('/') ? user.avatarUrl : undefined}
                      alt={user.displayName}
                      size="xs"
                    />
                    <span className={`flex-1 font-semibold truncate ${user.uid === profile?.uid ? 'text-blue-300' : 'text-white/70'}`}>
                      {user.displayName}
                      {user.uid === profile?.uid && <span className="ml-1.5 text-[8px] bg-[#0071E3] text-white px-1 py-0.5 rounded-full">YOU</span>}
                    </span>
                    <span className="font-bold tabular-nums text-white/50 text-[10px]">
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
                  className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5"
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
    </div>
  );
}
