import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { fetchLeaderboard } from '@/services/leaderboard';
import { generateDailyMissions, getDailyProgress } from '@/services/gamification';
import { getRecentSessions } from '@/services/study';
import { xpProgressInLevel } from '@/types/gamification';
import type { DailyProgress, MissionProgress } from '@/types/gamification';
import type { StudySession } from '@/types/study';
import type { UserProfile } from '@/types/user';
import { Avatar } from '@/components/ui/Avatar';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import SessionReviewModal from '@/components/study/SessionReviewModal';
import { LearningPath, type LearningPathNode } from '@/components/study/LearningPath';
import { getCurrentCefrLevel, getTargetCefrLevel } from '@/types/cefr';

const pathNodes: LearningPathNode[] = [
  {
    id: 'a1-grammar-foundations',
    unit: 1,
    unitTitle: 'Basic user · A1-A2',
    title: 'A1 grammar foundations',
    description: 'Build familiar phrases, basic sentence patterns, and everyday accuracy.',
    detail: 'CEFR A1 · Grammar',
    href: '/study?level=A1&skill=grammar',
    icon: Icons.BookOpenCheck,
    tone: 'sky',
  },
  {
    id: 'vocabulary-core',
    unit: 1,
    unitTitle: 'Basic user · A1-A2',
    title: 'Core vocabulary',
    description: 'Learn high-frequency words with active recall.',
    detail: 'Smart flashcards · 12 words',
    href: '/study/vocabulary',
    icon: Icons.Layers3,
    tone: 'violet',
  },
  {
    id: 'listening-conversations',
    unit: 1,
    unitTitle: 'Basic user · A1-A2',
    title: 'A2 everyday listening',
    description: 'Listen for familiar information, purpose, and simple next actions.',
    detail: 'CEFR A2 · Listening',
    href: '/study/listening',
    icon: Icons.Headphones,
    tone: 'emerald',
  },
  {
    id: 'checkpoint-one',
    unit: 1,
    unitTitle: 'Basic user · A1-A2',
    title: 'A1-A2 checkpoint',
    description: 'Repair unresolved mistakes before moving forward.',
    detail: 'Personalized review',
    href: '/study',
    state: { practiceMode: 'mistakes' },
    icon: Icons.ShieldCheck,
    tone: 'amber',
  },
  {
    id: 'b1-use-of-english',
    unit: 2,
    unitTitle: 'Independent user · B1-B2',
    title: 'B1 Use of English',
    description: 'Complete connected texts and follow the main points of clear language.',
    detail: 'CEFR B1 · Use of English',
    href: '/study?level=B1&skill=use-of-english',
    icon: Icons.Files,
    tone: 'sky',
  },
  {
    id: 'vocabulary-business',
    unit: 2,
    unitTitle: 'Independent user · B1-B2',
    title: 'Business word recall',
    description: 'Strengthen weak and due vocabulary with spaced review.',
    detail: 'Personalized recall',
    href: '/study/vocabulary',
    icon: Icons.Brain,
    tone: 'violet',
  },
  {
    id: 'b2-reading',
    unit: 2,
    unitTitle: 'Independent user · B1-B2',
    title: 'B2 reading for meaning',
    description: 'Find evidence, purpose, and inference in increasingly complex texts.',
    detail: 'CEFR B2 · Reading',
    href: '/study?level=B2&skill=reading',
    icon: Icons.Newspaper,
    tone: 'emerald',
  },
  {
    id: 'checkpoint-two',
    unit: 2,
    unitTitle: 'Independent user · B1-B2',
    title: 'B1-B2 checkpoint',
    description: 'Revisit weak answers across grammar and reading.',
    detail: 'Personalized review',
    href: '/study',
    state: { practiceMode: 'mistakes' },
    icon: Icons.Target,
    tone: 'amber',
  },
  {
    id: 'c1-mixed-mastery',
    unit: 3,
    unitTitle: 'Proficient user · C1-C2',
    title: 'C1 effective proficiency',
    description: 'Use precise language flexibly across academic and professional contexts.',
    detail: 'CEFR C1 · Adaptive practice',
    href: '/study?level=C1&skill=grammar',
    icon: Icons.Sparkles,
    tone: 'sky',
  },
  {
    id: 'c2-mastery',
    unit: 3,
    unitTitle: 'Proficient user · C1-C2',
    title: 'C2 mastery',
    description: 'Work with nuanced meaning, complex texts, and precise expression.',
    detail: 'CEFR C2 · Reading challenge',
    href: '/study?level=C2&skill=reading',
    icon: Icons.Trophy,
    tone: 'amber',
  },
];

function missionRoute(mission: MissionProgress): string {
  if (mission.type === 'words') return '/study/vocabulary';
  if (mission.type === 'listening') return '/study/listening';
  return '/study';
}

function WeeklyStreak({ profile }: { profile: UserProfile | null }) {
  const days = useMemo(() => {
    const today = new Date();
    const studiedToday = profile?.lastStudyDate === [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, '0'),
      String(today.getDate()).padStart(2, '0'),
    ].join('-');
    const streak = profile?.currentStreak ?? 0;

    return Array.from({ length: 7 }, (_, index) => {
      const daysAgo = 6 - index;
      const date = new Date(today);
      date.setDate(today.getDate() - daysAgo);
      const streakOffset = studiedToday ? daysAgo : daysAgo - 1;
      const completed = streakOffset >= 0 && streakOffset < streak;
      return {
        label: new Intl.DateTimeFormat('en', { weekday: 'narrow' }).format(date),
        day: date.getDate(),
        isToday: daysAgo === 0,
        completed,
      };
    });
  }, [profile?.currentStreak, profile?.lastStudyDate]);

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((day, index) => (
        <div key={`${day.label}-${index}`} className="text-center">
          <p className="text-[9px] font-black uppercase text-slate-400">{day.label}</p>
          <span className={`mt-1 flex aspect-square items-center justify-center rounded-full border text-[10px] font-black ${
            day.completed
              ? 'border-amber-500 bg-amber-400 text-white'
              : day.isToday
                ? 'border-sky-400 bg-sky-50 text-sky-700'
                : 'border-slate-200 bg-white text-slate-400'
          }`}>
            {day.completed ? <Icons.Flame className="h-3.5 w-3.5" /> : day.day}
          </span>
        </div>
      ))}
    </div>
  );
}

function GuestPreviewAside() {
  const highlights = [
    { icon: Icons.Route, title: 'Structured A1-C2 path', copy: 'Move from essential foundations to advanced reading and language use.' },
    { icon: Icons.BrainCircuit, title: 'Adaptive review', copy: 'Weak answers and due vocabulary return at useful intervals.' },
    { icon: Icons.ChartNoAxesCombined, title: 'Visible progress', copy: 'Track accuracy, study time, streaks, XP, and level growth.' },
  ];

  return (
    <>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-sky-100 text-sky-700">
          <Icons.Sparkles className="h-5 w-5" />
        </span>
        <p className="mt-4 text-[10px] font-black uppercase text-sky-700">Guest preview</p>
        <h2 className="mt-1 text-lg font-black text-slate-950">See the product first</h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">Browse the complete learning journey without an account. Sign in only when you choose a lesson.</p>
        <Link
          to="/register"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2.5 text-xs font-black text-white transition-colors hover:bg-slate-800"
        >
          Create free account <Icons.ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          to="/login"
          className="mt-2 inline-flex w-full items-center justify-center rounded-md border border-slate-200 px-4 py-2.5 text-xs font-black text-slate-700 transition-colors hover:bg-slate-50"
        >
          I already have an account
        </Link>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <p className="text-[10px] font-black uppercase text-emerald-700">Inside EnglishParty</p>
          <h2 className="mt-1 text-sm font-black text-slate-950">A complete practice loop</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {highlights.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex gap-3 px-5 py-4">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div className="min-w-0">
                <p className="text-xs font-black text-slate-800">{title}</p>
                <p className="mt-1 text-[11px] leading-4 text-slate-500">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[10px] font-black uppercase text-violet-700">CEFR coverage</p>
        <div className="mt-3 grid grid-cols-6 gap-1.5">
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level, index) => (
            <span
              key={level}
              className={`flex aspect-square items-center justify-center rounded-md text-[10px] font-black ${
                index < 2
                  ? 'bg-sky-100 text-sky-700'
                  : index < 4
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-violet-100 text-violet-700'
              }`}
            >
              {level}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}

export default function DashboardPage() {
  const { profile, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [selectedReviewSession, setSelectedReviewSession] = useState<StudySession | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadDashboardData() {
      if (!isAuthenticated || !profile?.uid) {
        setDailyProgress(null);
        setLeaderboard([]);
        setRecentSessions([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const [progressResult, leaderboardResult, sessionsResult] = await Promise.allSettled([
        getDailyProgress(profile.uid),
        fetchLeaderboard(),
        getRecentSessions(profile.uid, 4),
      ]);

      if (progressResult.status === 'fulfilled') setDailyProgress(progressResult.value);
      if (leaderboardResult.status === 'fulfilled') setLeaderboard(leaderboardResult.value);
      if (sessionsResult.status === 'fulfilled') setRecentSessions(sessionsResult.value);
      setLoading(false);
    }

    void loadDashboardData();
  }, [isAuthenticated, profile?.uid]);

  const learningActions = (profile?.totalQuestionsAnswered ?? 0) + (profile?.vocabularyLearned ?? 0);
  const completedPathSteps = isAuthenticated
    ? Math.min(pathNodes.length, Math.floor(learningActions / 10))
    : 0;
  const currentNode = pathNodes[Math.min(completedPathSteps, pathNodes.length - 1)];
  const dailyGoal = Math.max(5, profile?.dailyGoalMinutes ?? 15);
  const activeMinutes = dailyProgress?.activeMinutes ?? 0;
  const dailyGoalPercent = Math.min(100, Math.round((activeMinutes / dailyGoal) * 100));
  const levelProgress = xpProgressInLevel(profile?.xp ?? 0);
  const missions = dailyProgress?.missions ?? generateDailyMissions().map((mission) => ({
    missionId: mission.id,
    type: mission.type,
    title: mission.title,
    target: mission.target,
    current: 0,
    completed: false,
    xpReward: mission.xpReward,
  }));
  const completedMissionCount = missions.filter((mission) => mission.completed).length;
  const currentRank = leaderboard.findIndex((user) => user.uid === profile?.uid) + 1;
  const currentCefrLevel = getCurrentCefrLevel(profile);
  const targetCefrLevel = getTargetCefrLevel(profile);

  return (
    <div className="mx-auto grid w-full max-w-[1280px] gap-5 pb-10 text-slate-800 xl:grid-cols-[minmax(0,1fr)_340px]">
      <main className="min-w-0 space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase text-sky-700">{isAuthenticated ? 'CEFR learning path' : 'Explore EnglishParty'}</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
              {isAuthenticated
                ? `Keep moving, ${profile?.displayName?.split(' ')[0] ?? 'learner'}`
                : 'Your English journey, from A1 to C2'}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {isAuthenticated
                ? 'One focused lesson at a time, with review placed where it helps most.'
                : 'Explore the full roadmap now. You only need to sign in when you are ready to begin a lesson.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm">
              <Icons.Gauge className="h-4 w-4 text-sky-600" />
              {isAuthenticated ? `CEFR ${currentCefrLevel} → ${targetCefrLevel}` : 'CEFR A1 → C2 roadmap'}
            </span>
          </div>
        </header>

        {isAuthenticated ? (
          <section className="grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:hidden">
          <Link to="/study" className="flex min-w-0 items-center gap-2 px-3 py-3 transition-colors hover:bg-slate-50">
            <Icons.Target className="h-4 w-4 shrink-0 text-sky-600" />
            <span className="min-w-0">
              <span className="block truncate text-[9px] font-black uppercase text-slate-400">Daily goal</span>
              <span className="block text-xs font-black text-slate-900">{dailyGoalPercent}%</span>
            </span>
          </Link>
          <Link to="/" className="flex min-w-0 items-center gap-2 px-3 py-3 transition-colors hover:bg-slate-50">
            <Icons.Flame className="h-4 w-4 shrink-0 fill-amber-300 text-amber-500" />
            <span className="min-w-0">
              <span className="block truncate text-[9px] font-black uppercase text-slate-400">Streak</span>
              <span className="block text-xs font-black text-slate-900">{profile?.currentStreak ?? 0} days</span>
            </span>
          </Link>
          <Link to="/missions" className="flex min-w-0 items-center gap-2 px-3 py-3 transition-colors hover:bg-slate-50">
            <Icons.ListChecks className="h-4 w-4 shrink-0 text-emerald-600" />
            <span className="min-w-0">
              <span className="block truncate text-[9px] font-black uppercase text-slate-400">Quests</span>
              <span className="block text-xs font-black text-slate-900">{completedMissionCount}/{Math.min(3, missions.length)}</span>
            </span>
          </Link>
          </section>
        ) : (
          <section className="grid grid-cols-3 divide-x divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:hidden">
            {[
              { icon: Icons.Languages, label: 'CEFR levels', value: 'A1-C2' },
              { icon: Icons.LibraryBig, label: 'Learning modes', value: '5 modes' },
              { icon: Icons.Repeat2, label: 'Review system', value: 'Adaptive' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex min-w-0 items-center gap-2 px-3 py-3">
                <Icon className="h-4 w-4 shrink-0 text-sky-600" />
                <span className="min-w-0">
                  <span className="block truncate text-[9px] font-black uppercase text-slate-400">{label}</span>
                  <span className="block truncate text-xs font-black text-slate-900">{value}</span>
                </span>
              </div>
            ))}
          </section>
        )}

        <section className="grid overflow-hidden rounded-lg border border-emerald-700 bg-emerald-600 text-white shadow-sm sm:grid-cols-[minmax(0,1fr)_auto]">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-100">
              <Icons.Navigation className="h-4 w-4" /> {isAuthenticated ? 'Next on your path' : 'Start when you are ready'}
            </div>
            <h2 className="mt-2 text-xl font-black sm:text-2xl">{currentNode.title}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-emerald-50">{currentNode.description}</p>
            <p className="mt-3 text-xs font-bold text-emerald-100">{currentNode.detail}</p>
          </div>
          <div className="flex items-center border-t border-emerald-500 bg-emerald-700/40 p-5 sm:border-l sm:border-t-0">
            <Link
              to={currentNode.href}
              state={currentNode.state}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white bg-white px-5 py-3 text-sm font-black text-emerald-700 shadow-[0_4px_0_rgba(6,78,59,0.35)] transition-transform hover:-translate-y-0.5 active:translate-y-1 active:shadow-none sm:w-auto"
            >
              <Icons.Play className="h-4 w-4 fill-current" /> {isAuthenticated ? 'Continue' : 'Start learning'}
            </Link>
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <p className="text-[10px] font-black uppercase text-sky-700">Course map</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">English A1-C2 journey</h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {isAuthenticated ? `${completedPathSteps} / ${pathNodes.length} steps mastered` : `${pathNodes.length} learning steps to explore`}
            </span>
          </div>
          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="space-y-5">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="mx-auto h-14 w-14 rounded-full" />
                <Skeleton className="mx-auto h-14 w-14 rounded-full" />
                <Skeleton className="mx-auto h-14 w-14 rounded-full" />
              </div>
            ) : (
              <LearningPath nodes={pathNodes} completedCount={completedPathSteps} previewMode={!isAuthenticated} />
            )}
          </div>
        </section>

        {isAuthenticated ? (
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-[10px] font-black uppercase text-sky-700">Review</p>
              <h2 className="mt-1 text-base font-black text-slate-950">Recent lessons</h2>
            </div>
            <Link to="/profile" className="inline-flex items-center gap-1 text-xs font-black text-sky-700">
              History <Icons.ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
              <Skeleton className="h-24 rounded-none" />
              <Skeleton className="h-24 rounded-none" />
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">Complete your first path lesson to see review history.</div>
          ) : (
            <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
              {recentSessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setSelectedReviewSession(session)}
                  className="flex min-h-24 items-center gap-3 bg-white p-4 text-left transition-colors hover:bg-slate-50"
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${
                    session.type === 'listening'
                      ? 'bg-emerald-100 text-emerald-700'
                      : session.type === 'vocabulary'
                        ? 'bg-violet-100 text-violet-700'
                        : 'bg-sky-100 text-sky-700'
                  }`}>
                    {session.type === 'listening' ? <Icons.Headphones className="h-5 w-5" /> : session.type === 'vocabulary' ? <Icons.Layers3 className="h-5 w-5" /> : <Icons.BookOpenCheck className="h-5 w-5" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-black capitalize text-slate-900">{session.type} practice</span>
                    <span className="mt-1 block text-xs text-slate-500">{session.questionsAttempted} items · {session.accuracy}% accuracy</span>
                  </span>
                  <span className="text-xs font-black text-emerald-600">+{session.xpEarned} XP</span>
                </button>
              ))}
            </div>
          )}
          </section>
        ) : (
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:hidden">
            <div className="border-b border-slate-200 px-5 py-4">
              <p className="text-[10px] font-black uppercase text-emerald-700">How learning works</p>
              <h2 className="mt-1 text-base font-black text-slate-950">Practice, review, and keep improving</h2>
            </div>
            <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                { icon: Icons.MousePointerClick, title: 'Choose a skill', copy: 'Start at your CEFR level and focus on one clear objective.' },
                { icon: Icons.MessageCircleQuestion, title: 'Get feedback', copy: 'See explanations and corrections immediately after each answer.' },
                { icon: Icons.RefreshCw, title: 'Review smarter', copy: 'Mistakes and vocabulary return when they are useful to recall.' },
              ].map(({ icon: Icon, title, copy }) => (
                <div key={title} className="p-5">
                  <Icon className="h-5 w-5 text-emerald-600" />
                  <h3 className="mt-3 text-sm font-black text-slate-900">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{copy}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <aside className="hidden space-y-4 xl:sticky xl:top-20 xl:block xl:self-start">
        {isAuthenticated ? (
          <>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase text-sky-700">Daily goal</p>
              <h2 className="mt-1 text-lg font-black text-slate-950">{activeMinutes} of {dailyGoal} minutes</h2>
              <p className="mt-1 text-xs text-slate-500">{dailyGoalPercent >= 100 ? 'Goal complete. Keep the momentum.' : `${dailyGoal - activeMinutes} minutes left today.`}</p>
            </div>
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(#0ea5e9 ${dailyGoalPercent * 3.6}deg, #e2e8f0 0deg)` }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-black text-slate-900">{dailyGoalPercent}%</div>
            </div>
          </div>
          <Progress value={dailyGoalPercent} height="sm" className="mt-4" />
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase text-amber-600">Study streak</p>
              <h2 className="mt-1 flex items-center gap-2 text-lg font-black text-slate-950">
                <Icons.Flame className="h-5 w-5 fill-amber-400 text-amber-500" /> {profile?.currentStreak ?? 0} days
              </h2>
            </div>
            <span className="text-[10px] font-bold text-slate-400">Best {profile?.longestStreak ?? 0}</span>
          </div>
          <WeeklyStreak profile={profile} />
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-black text-slate-950">
              <Icons.ListChecks className="h-4 w-4 text-sky-600" /> Daily quests
            </h2>
            <Link to="/missions" className="text-xs font-black text-sky-700">All</Link>
          </div>
          <div className="divide-y divide-slate-100">
            {missions.slice(0, 3).map((mission) => {
              const percent = Math.min(100, (mission.current / Math.max(1, mission.target)) * 100);
              return (
                <button
                  key={mission.missionId}
                  type="button"
                  onClick={() => navigate(missionRoute(mission))}
                  className="w-full p-4 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs font-bold ${mission.completed ? 'text-emerald-700' : 'text-slate-700'}`}>{mission.title}</span>
                    <span className="text-[10px] font-black text-sky-700">+{mission.xpReward} XP</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={percent} height="sm" className="flex-1" />
                    <span className="w-12 text-right text-[9px] font-bold text-slate-400">{mission.current}/{mission.target}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase text-violet-700">Level {profile?.level ?? 0}</p>
              <h2 className="mt-1 text-base font-black text-slate-950">{profile?.xp?.toLocaleString() ?? 0} total XP</h2>
            </div>
            <Icons.Zap className="h-6 w-6 fill-violet-200 text-violet-600" />
          </div>
          <Progress value={levelProgress.percentage} height="sm" className="mt-4" />
          <p className="mt-2 text-[10px] font-bold text-slate-400">{levelProgress.current} / {levelProgress.required} XP to next level</p>
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p className="text-[10px] font-black uppercase text-amber-600">Weekly league</p>
              <h2 className="mt-1 text-sm font-black text-slate-950">{currentRank > 0 ? `You are #${currentRank}` : 'Join the standings'}</h2>
            </div>
            <Link to="/leaderboard" aria-label="Open leaderboard" className="text-slate-400 hover:text-sky-700">
              <Icons.ArrowUpRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {leaderboard.slice(0, 3).map((user, index) => (
              <div key={user.uid} className="flex items-center gap-3 px-4 py-3">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${index === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{index + 1}</span>
                <Avatar
                  fallback={user.avatarUrl && !user.avatarUrl.includes('/') ? user.avatarUrl : undefined}
                  src={user.avatarUrl && user.avatarUrl.includes('/') ? user.avatarUrl : undefined}
                  alt={user.displayName}
                  size="xs"
                />
                <span className="min-w-0 flex-1 truncate text-xs font-bold text-slate-700">{user.displayName}</span>
                <span className="text-[10px] font-black text-slate-500">{user.xp.toLocaleString()} XP</span>
              </div>
            ))}
          </div>
        </section>
          </>
        ) : (
          <GuestPreviewAside />
        )}
      </aside>

      <SessionReviewModal
        isOpen={selectedReviewSession !== null}
        onClose={() => setSelectedReviewSession(null)}
        session={selectedReviewSession}
      />
    </div>
  );
}
