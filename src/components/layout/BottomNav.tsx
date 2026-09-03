import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { NAV_ITEMS } from '@/utils/constants';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-[1fr_auto_auto] items-center gap-2 border-t border-slate-200 bg-white/95 px-3 py-2 backdrop-blur-xl lg:hidden">
        <Link to="/" className="flex min-w-0 items-center gap-2 px-2 text-sm font-black text-slate-950">
          <Icons.Map className="h-5 w-5 shrink-0 text-sky-600" />
          <span className="truncate">Course map</span>
        </Link>
        <Link to="/login" className="rounded-md border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">
          Sign in
        </Link>
        <Link to="/register" className="rounded-md bg-slate-950 px-3 py-2 text-xs font-bold text-white">
          Join free
        </Link>
      </nav>
    );
  }

  return (
    <nav 
      className="fixed bottom-0 inset-x-0 lg:hidden bg-white/80 backdrop-blur-xl border-t border-slate-200/80 flex items-center justify-around px-2 z-30"
    >
      {NAV_ITEMS.filter((item) => item.path !== '/friends').map((item) => {
        const isActive = item.path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.path);
        const Icon = (Icons as any)[item.icon] || Icons.HelpCircle;

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center flex-1 py-1 relative text-center cursor-pointer"
          >
            {isActive && (
              <motion.div
                layoutId="active-bottom-indicator"
                className="absolute inset-0 mx-auto w-12 h-12 bg-[#0071E3]/8 rounded-2xl -z-10"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            <Icon
              className={`w-5 h-5 transition-transform duration-200 ${
                isActive
                  ? 'text-[#0071E3] scale-110'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            />
            <span
              className={`text-[10px] mt-1 transition-all duration-200 ${
                isActive ? 'text-[#0071E3] font-medium scale-105' : 'text-slate-500'
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
