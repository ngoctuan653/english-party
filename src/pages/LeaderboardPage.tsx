import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { fetchLeaderboard } from '@/services/leaderboard';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import type { UserProfile } from '@/types/user';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function LeaderboardPage() {
  const { profile } = useAuthStore();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        setLoading(true);
        const list = await fetchLeaderboard();
        setUsers(list);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="space-y-6 pb-8 text-slate-800 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          <span className="bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
            Division Leaderboard
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Climb the ranks and compete for the top spot
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-52 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Icons.Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No players yet. Be the first!</p>
        </div>
      ) : (
        <>
          {/* ═══════════════ PODIUM ═══════════════ */}
          {top3.length >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f3460] shadow-xl"
            >
              {/* Background glow */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 -translate-x-1/2 w-80 h-80 bg-amber-400/8 rounded-full blur-3xl" />
                <div className="absolute right-0 bottom-0 w-48 h-48 bg-blue-500/8 rounded-full blur-3xl" />
              </div>

              <p className="text-center text-xs font-bold uppercase tracking-widest text-white/30 pt-5 mb-4 relative z-10">
                🏆 Top Performers
              </p>

              {/* Podium columns: 2nd | 1st | 3rd */}
              <div className="relative z-10 px-6 sm:px-10 pb-0">
                <div className="flex items-end justify-center gap-4 sm:gap-10 md:gap-14">
                  {/* 2nd place (left) */}
                  {top3.length >= 2 && (
                    <div className="flex flex-col items-center flex-1 max-w-[130px]">
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
                      <p className="mt-2 text-xs font-bold text-white/80 max-w-[90px] truncate text-center">{top3[1].displayName}</p>
                      <p className="text-[10px] tabular-nums font-semibold text-slate-400">{top3[1].xp.toLocaleString()} XP</p>
                      {/* Silver block */}
                      <div className="mt-2 w-full h-24 sm:h-28 bg-gradient-to-b from-[#C0C8D8] to-[#8A95A5] rounded-t-lg flex items-center justify-center shadow-lg shadow-slate-500/20 relative">
                        <span className="text-4xl sm:text-5xl font-black text-white/80">2</span>
                        <span className="absolute top-2 text-xl">🥈</span>
                      </div>
                    </div>
                  )}

                  {/* 1st place (center, tallest) */}
                  <div className="flex flex-col items-center flex-1 max-w-[150px]">
                    <motion.span
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                      className="text-4xl sm:text-5xl mb-1 drop-shadow-lg"
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
                    <p className="mt-2 text-base font-extrabold text-amber-300 max-w-[120px] truncate text-center">{top3[0].displayName}</p>
                    <p className="text-xs tabular-nums font-bold text-amber-400/80">{top3[0].xp.toLocaleString()} XP</p>
                    {/* Gold block */}
                    <div className="mt-2 w-full h-32 sm:h-36 bg-gradient-to-b from-[#F5C842] to-[#C97D10] rounded-t-lg flex items-center justify-center shadow-xl shadow-amber-500/30 relative">
                      <span className="text-5xl sm:text-6xl font-black text-white/90">1</span>
                      <span className="absolute top-2 text-2xl">🥇</span>
                    </div>
                  </div>

                  {/* 3rd place (right, shortest) */}
                  {top3.length >= 3 && (
                    <div className="flex flex-col items-center flex-1 max-w-[130px]">
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
                      <p className="mt-2 text-xs font-bold text-white/70 max-w-[90px] truncate text-center">{top3[2].displayName}</p>
                      <p className="text-[10px] tabular-nums font-semibold text-slate-400">{top3[2].xp.toLocaleString()} XP</p>
                      {/* Bronze block */}
                      <div className="mt-2 w-full h-16 sm:h-20 bg-gradient-to-b from-[#D4845A] to-[#A05A30] rounded-t-lg flex items-center justify-center shadow-lg shadow-amber-800/20 relative">
                        <span className="text-3xl sm:text-4xl font-black text-white/80">3</span>
                        <span className="absolute top-1.5 text-lg">🥉</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════ RANKINGS LIST (4th onward) ═══════════════ */}
          {rest.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-2"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
                Rankings
              </p>
              {rest.map((user, idx) => {
                const isCurrentUser = user.uid === profile?.uid;
                const rank = idx + 4;

                return (
                  <motion.div
                    key={user.uid}
                    variants={itemVariants}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                      isCurrentUser
                        ? 'border-[#0071E3]/40 bg-[#0071E3]/6 shadow-sm'
                        : 'border-slate-200/60 bg-white hover:bg-slate-50 shadow-sm'
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                      #{rank}
                    </span>

                    <Avatar
                      fallback={user.avatarUrl && !user.avatarUrl.includes('/') ? user.avatarUrl : undefined}
                      src={user.avatarUrl && user.avatarUrl.includes('/') ? user.avatarUrl : undefined}
                      alt={user.displayName}
                      size="sm"
                    />

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold truncate ${isCurrentUser ? 'text-[#0071E3]' : 'text-slate-800'}`}>
                        {user.displayName}
                        {isCurrentUser && (
                          <span className="ml-2 text-[9px] text-[#0071E3] font-bold bg-[#0071E3]/10 border border-[#0071E3]/20 px-1.5 py-0.5 rounded-full">
                            YOU
                          </span>
                        )}
                      </p>
                      {user.currentStreak > 0 && (
                        <p className="text-[10px] text-slate-400 mt-0.5">🔥 {user.currentStreak} day streak</p>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-extrabold tabular-nums text-slate-700">
                        {user.xp.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-slate-400 font-semibold">XP</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
