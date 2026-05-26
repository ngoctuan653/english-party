import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, UserIcon, Check, X } from 'lucide-react';
import { registerWithEmail, signInWithGoogle } from '@/services/firebase/auth';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { AVATARS } from '@/utils/constants';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-orange-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-yellow-500' };
  if (score <= 4) return { score, label: 'Strong', color: 'bg-green-500' };
  return { score, label: 'Excellent', color: 'bg-emerald-400' };
}

export function RegisterForm() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (!displayName.trim()) {
      setError('Please enter your display name.');
      return;
    }

    setIsLoading(true);

    try {
      await registerWithEmail(email, password, displayName.trim());
      navigate('/');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      if (message.includes('email-already-in-use')) {
        setError('This email is already registered. Try signing in instead.');
      } else if (message.includes('weak-password')) {
        setError('Password is too weak. Please use a stronger password.');
      } else if (message.includes('invalid-email')) {
        setError('Please enter a valid email address.');
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
          <h2 className="text-2xl font-bold text-slate-900">Create Account</h2>
          <p className="text-slate-500 mt-1.5 text-sm">Start your English learning adventure</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Picker */}
          <motion.div variants={item}>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Choose your avatar
            </label>
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              {AVATARS.map((avatar) => (
                <motion.button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl
                    transition-all duration-200 cursor-pointer ${
                      selectedAvatar === avatar
                        ? 'bg-[#0071E3] ring-2 ring-[#0071E3]/30 shadow-md shadow-[#0071E3]/10 text-white'
                        : 'bg-white hover:bg-slate-100 border border-slate-200'
                    }`}
                >
                  {avatar}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Display Name */}
          <motion.div variants={item}>
            <label htmlFor="displayName" className="block text-sm font-medium text-slate-700 mb-1.5">
              Display Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                required
                maxLength={30}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200
                  text-slate-800 placeholder-slate-400 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#0071E3]/25 focus:border-[#0071E3]
                  hover:border-slate-300 transition-all duration-200"
              />
            </div>
          </motion.div>

          {/* Email */}
          <motion.div variants={item}>
            <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                id="reg-email"
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

          {/* Password */}
          <motion.div variants={item}>
            <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
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
            {/* Password Strength Indicator */}
            <AnimatePresence>
              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength.score
                              ? passwordStrength.color
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-slate-500 min-w-[60px] text-right">
                      {passwordStrength.label}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Confirm Password */}
          <motion.div variants={item}>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className={`w-full pl-11 pr-12 py-3 rounded-xl bg-slate-50/50 border text-sm
                  text-slate-800 placeholder-slate-400
                  focus:outline-none focus:ring-2 transition-all duration-200 ${
                    passwordsMismatch
                      ? 'border-rose-400 focus:ring-rose-500/25 focus:border-rose-400'
                      : passwordsMatch
                        ? 'border-emerald-400 focus:ring-emerald-500/25 focus:border-emerald-400'
                        : 'border-slate-200 focus:ring-[#0071E3]/25 focus:border-[#0071E3] hover:border-slate-300'
                  }`}
              />
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {passwordsMatch && <Check className="w-4.5 h-4.5 text-emerald-500" />}
                {passwordsMismatch && <X className="w-4.5 h-4.5 text-rose-500" />}
              </div>
            </div>
            {passwordsMismatch && (
              <p className="mt-1 text-xs text-rose-500">Passwords do not match</p>
            )}
          </motion.div>

          <motion.div variants={item} className="pt-1">
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
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Account'
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
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-[#0071E3] hover:text-[#0077ED] font-medium transition-colors"
          >
            Sign in
          </Link>
        </motion.p>
      </div>
    </motion.div>
  );
}
