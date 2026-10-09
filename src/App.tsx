import { useAuth } from '@/hooks/useAuth';
import Router from '@/Router';

export default function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-sky-400 shadow-xl shadow-primary/20 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🎉</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">EnglishParty</h1>
          <p className="text-slate-500 text-sm font-medium">Đang tải dữ liệu học tập...</p>
          <div className="mt-6 w-48 mx-auto">
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-sky-400 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Router />;
}


