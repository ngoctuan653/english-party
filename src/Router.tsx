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

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center animate-pulse">
          <span className="text-2xl">🎉</span>
        </div>
        <div className="text-white/60 text-sm">Loading...</div>
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

        {/* Protected routes */}
        <Route
          element={
            <AuthGuard>
              <AppLayout />
            </AuthGuard>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/study" element={<StudyPage />} />
          <Route path="/study/vocabulary" element={<VocabularyPage />} />
          <Route path="/study/listening" element={<ListeningPage />} />
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
