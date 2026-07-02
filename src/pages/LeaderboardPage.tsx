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
              className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/70"
            >
              <div className="relative z-10 flex items-center justify-center gap-2 border-b border-slate-100 px-6 py-4">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500 ring-1 ring-amber-100">
                  <Icons.Trophy className="h-4 w-4" />
                </span>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Top Performers
                </p>
              </div>

              {/* Podium columns: 2nd | 1st | 3rd */}
              <div className="relative z-10 bg-gradient-to-b from-white to-slate-50 px-6 pb-0 pt-6 sm:px-10">
                <div className="flex items-end justify-center gap-4 sm:gap-10 md:gap-14">
                  {/* 2nd place (left) */}
                  {top3.length >= 2 && (
                    <div className="flex max-w-[130px] flex-1 flex-col items-center">
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
                      <p className="mt-2 max-w-[96px] truncate text-center text-xs font-bold text-slate-700">{top3[1].displayName}</p>
                      <p className="text-[10px] font-semibold tabular-nums text-slate-400">{top3[1].xp.toLocaleString()} XP</p>
                      {/* Silver block */}
                      <div className="relative mt-3 flex h-24 w-full items-center justify-center rounded-t-xl bg-gradient-to-b from-slate-200 to-slate-400 shadow-lg shadow-slate-300/40 sm:h-28">
                        <span className="absolute top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[10px] font-black text-slate-500 ring-1 ring-white">2</span>
                        <span className="text-4xl font-black text-white/90 sm:text-5xl">2</span>
                      </div>
                    </div>
                  )}

                  {/* 1st place (center, tallest) */}
                  <div className="flex max-w-[150px] flex-1 flex-col items-center">
                    <motion.div
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                      className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500 shadow-sm ring-1 ring-amber-100 sm:h-11 sm:w-11"
                    >
                      <Icons.Trophy className="h-6 w-6" />
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
                    <p className="mt-2 max-w-[124px] truncate text-center text-base font-extrabold text-slate-900">{top3[0].displayName}</p>
                    <p className="text-xs font-bold tabular-nums text-amber-600">{top3[0].xp.toLocaleString()} XP</p>
                    {/* Gold block */}
                    <div className="relative mt-3 flex h-32 w-full items-center justify-center rounded-t-xl bg-gradient-to-b from-[#FFD95A] to-[#E19A16] shadow-xl shadow-amber-300/50 sm:h-36">
                      <span className="absolute top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/85 text-xs font-black text-amber-600 ring-1 ring-white">1</span>
                      <span className="text-5xl font-black text-white sm:text-6xl">1</span>
                    </div>
                  </div>

                  {/* 3rd place (right, shortest) */}
                  {top3.length >= 3 && (
                    <div className="flex max-w-[130px] flex-1 flex-col items-center">
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
                      <p className="mt-2 max-w-[96px] truncate text-center text-xs font-bold text-slate-700">{top3[2].displayName}</p>
                      <p className="text-[10px] font-semibold tabular-nums text-slate-400">{top3[2].xp.toLocaleString()} XP</p>
                      {/* Bronze block */}
                      <div className="relative mt-3 flex h-20 w-full items-center justify-center rounded-t-xl bg-gradient-to-b from-[#D99567] to-[#B56A3E] shadow-lg shadow-orange-200/50">
                        <span className="absolute top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white/80 text-[10px] font-black text-orange-700 ring-1 ring-white">3</span>
                        <span className="text-3xl font-black text-white/90 sm:text-4xl">3</span>
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
                        ? 'border-[#0071E3]/30 bg-blue-50 shadow-sm'
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
                      className="rounded-full ring-2 ring-white"
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
