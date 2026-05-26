import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signInWithEmail, signInWithGoogle } from '@/services/firebase/auth';
import { GoogleButton } from '@/components/auth/GoogleButton';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmail(email, password);
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      if (message.includes('user-not-found') || message.includes('wrong-password') || message.includes('invalid-credential')) {
        setError('Invalid email or password. Please try again.');
      } else if (message.includes('too-many-requests')) {
        setError('Too many attempts. Please try again later.');
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      if (!message.includes('popup-closed')) {
        setError(message);
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-md mx-auto"
    >
      <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-xl shadow-slate-200/50">
        <motion.div variants={item} className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-1.5 text-sm">Sign in to continue your learning journey</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <motion.div variants={item}>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200
                  text-slate-800 placeholder-slate-400 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#0071E3]/25 focus:border-[#0071E3]
                  hover:border-slate-300 transition-all duration-200"
              />
            </div>
          </motion.div>

          <motion.div variants={item}>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-12 py-3 rounded-xl bg-slate-50/50 border border-slate-200
                  text-slate-800 placeholder-slate-400 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#0071E3]/25 focus:border-[#0071E3]
                  hover:border-slate-300 transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </motion.div>

          <motion.div variants={item} className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 bg-white text-[#0071E3]
                  focus:ring-[#0071E3]/25 focus:ring-offset-0"
              />
              <span className="text-sm text-slate-500">Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-[#0071E3] hover:text-[#0077ED] font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </motion.div>

          <motion.div variants={item}>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white
                bg-[#0071E3] hover:bg-[#0077ED]
                shadow-md shadow-[#0071E3]/15
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </motion.div>
        </form>

        <motion.div variants={item} className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 uppercase tracking-wider">or</span>
          <div className="flex-1 h-px bg-slate-200" />
        </motion.div>

        <motion.div variants={item}>
          <GoogleButton onClick={handleGoogleSignIn} isLoading={isGoogleLoading} />
        </motion.div>

        <motion.p variants={item} className="mt-8 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-[#0071E3] hover:text-[#0077ED] font-medium transition-colors"
          >
            Create one
          </Link>
        </motion.p>
      </div>
    </motion.div>
  );
}
