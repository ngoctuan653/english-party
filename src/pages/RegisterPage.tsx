import { RegisterForm } from '@/components/auth/RegisterForm';
import { useAuthStore } from '@/stores/authStore';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const { isAuthenticated } = useAuthStore();

  // If already logged in, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col lg:flex-row relative overflow-hidden">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0071E3]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute top-[40%] right-[30%] w-[30%] h-[30%] bg-blue-500/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Left side: Branding/Feature Pitch (hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-16 relative z-10 border-r border-slate-200 bg-[#F5F5F7]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎉</span>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-[#0071E3] bg-clip-text text-transparent">
            EnglishParty
          </span>
        </div>

        <div className="my-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl font-black tracking-tight leading-tight text-slate-900">
              Join the{' '}
              <span className="bg-gradient-to-r from-blue-600 to-[#0071E3] bg-clip-text text-transparent">
                Study Party
              </span>
              <br />
              and Rank Up.
            </h1>
            <p className="text-slate-500 mt-4 text-lg max-w-lg leading-relaxed">
              Create your account, select your target score, pick a unique character avatar, and start competing with friends on your learning journey.
            </p>
          </motion.div>

          <div className="space-y-4">
            {[
              { emoji: '🎓', title: 'Curated TOEIC 700-800', desc: 'Focus specifically on high-level vocabulary, grammar and listening sets.' },
              { emoji: '🔥', title: 'Streak Accountability', desc: 'Encourage each other to maintain daily streaks. Don\'t break the chain!' },
              { emoji: '🏆', title: 'Weekly Bragging Rights', desc: 'Climb the division leaderboard. Winners get exclusive profile accolades.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 max-w-md hover:bg-slate-50 transition-colors duration-300 shadow-sm"
              >
                <span className="text-2xl p-1 shrink-0">{feature.emoji}</span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">{feature.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="text-xs text-slate-400">© 2026 EnglishParty. Built for high achievers.</p>
      </div>

      {/* Right side: RegisterForm container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 relative z-10 lg:w-1/2 auth-container">
        {/* Mobile Header Branding */}
        <div className="lg:hidden flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-[#0071E3] flex items-center justify-center shadow-md mb-4 animate-pulse text-white">
            <span className="text-3xl">🎉</span>
          </div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-[#0071E3] bg-clip-text text-transparent">
            EnglishParty
          </h1>
          <p className="text-xs text-slate-500 mt-1.5">Join the study party with your friends</p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <RegisterForm />
        </motion.div>
      </div>
    </div>
  );
}
