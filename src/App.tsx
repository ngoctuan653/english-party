import { useAuth } from '@/hooks/useAuth';
import Router from '@/Router';

export default function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl">🎉</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">EnglishParty</h1>
          <p className="text-white/40 text-sm">Loading your study party...</p>
          <div className="mt-6 w-48 mx-auto">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-600 via-blue-500 to-teal-400 rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Router />;
}


