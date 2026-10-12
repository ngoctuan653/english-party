import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AppLayout } from '@/components/layout/AppLayout';

// Lazy-loaded pages
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const StudyPage = lazy(() => import('@/pages/StudyPage'));
const VocabularyPage = lazy(() => import('@/pages/VocabularyPage'));
const ListeningPage = lazy(() => import('@/pages/ListeningPage'));
const SpeakingPage = lazy(() => import('@/pages/SpeakingPage'));
const MissionsPage = lazy(() => import('@/pages/MissionsPage'));
const LeaderboardPage = lazy(() => import('@/pages/LeaderboardPage'));
const FriendsPage = lazy(() => import('@/pages/FriendsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

// Admin pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminQuestionsPage = lazy(() => import('@/pages/admin/AdminQuestionsPage'));
const AdminVocabularyPage = lazy(() => import('@/pages/admin/AdminVocabularyPage'));
const AdminImportPage = lazy(() => import('@/pages/admin/AdminImportPage'));

// Chinese module pages
const ChineseDashboardPage = lazy(() => import('@/pages/chinese/ChineseDashboardPage'));
const PinyinTrainerPage = lazy(() => import('@/pages/chinese/PinyinTrainerPage'));
const ChineseVocabPage = lazy(() => import('@/pages/chinese/ChineseVocabPage'));
const ChineseGrammarPage = lazy(() => import('@/pages/chinese/ChineseGrammarPage'));
const ChineseListeningPage = lazy(() => import('@/pages/chinese/ChineseListeningPage'));
const ChineseSpeakingPage = lazy(() => import('@/pages/chinese/ChineseSpeakingPage'));
const ChineseReadingPage = lazy(() => import('@/pages/chinese/ChineseReadingPage'));
const HskMockExamPage = lazy(() => import('@/pages/chinese/HskMockExamPage'));
const HanziWritingPage = lazy(() => import('@/pages/chinese/HanziWritingPage'));
const VnPayReturnPage = lazy(() => import('@/pages/payment/VnPayReturnPage'));

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-200/50 animate-pulse">
          <span className="text-2xl">🇨🇳</span>
        </div>
        <div className="text-slate-500 text-sm font-medium">Đang tải dữ liệu học tập...</div>
      </div>
    </div>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function Router() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/chinese" element={<ChineseDashboardPage />} />
          <Route path="/chinese/pinyin" element={<PinyinTrainerPage />} />
          <Route path="/chinese/vocab" element={<ChineseVocabPage />} />
          <Route path="/chinese/grammar" element={<ChineseGrammarPage />} />
          <Route path="/chinese/listening" element={<ChineseListeningPage />} />
          <Route path="/chinese/speaking" element={<ChineseSpeakingPage />} />
          <Route path="/chinese/reading" element={<ChineseReadingPage />} />
          <Route path="/chinese/mock" element={<HskMockExamPage />} />
          <Route path="/chinese/writing" element={<HanziWritingPage />} />
          <Route path="/payment/vnpay-return" element={<VnPayReturnPage />} />
        </Route>

        {/* Protected routes */}
        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route path="/study" element={<StudyPage />} />
          <Route path="/study/toeic" element={<StudyPage />} />
          <Route path="/study/vocabulary" element={<VocabularyPage />} />
          <Route path="/study/listening" element={<ListeningPage />} />
          <Route path="/study/speaking" element={<SpeakingPage />} />
          <Route path="/missions" element={<MissionsPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <AdminGuard>
                <AppLayout />
              </AdminGuard>
            </AuthGuard>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="questions" element={<AdminQuestionsPage />} />
          <Route path="vocabulary" element={<AdminVocabularyPage />} />
          <Route path="import" element={<AdminImportPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
