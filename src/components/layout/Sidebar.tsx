import { useLocation, Link, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { signOut } from '@/services/firebase/auth';
import { NAV_ITEMS } from '@/utils/constants';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, reset } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
      reset();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 hidden lg:flex flex-col bg-white border-r border-slate-200/60 z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
        <span className="text-2xl animate-pulse">🎉</span>
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-[#0071E3] bg-clip-text text-transparent">
          EnglishParty
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = (Icons as any)[item.icon] || Icons.HelpCircle;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${
                isActive
                  ? 'text-[#0071E3] font-semibold bg-[#0071E3]/8 border border-[#0071E3]/15'
                  : 'text-slate-600 hover:text-[#1d1d1f] hover:bg-slate-50 border border-transparent'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav-indicator"
                  className="absolute left-0 w-1 h-6 bg-[#0071E3] rounded-full"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-[#0071E3]' : 'text-slate-400 group-hover:text-[#0071E3]'
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Admin Link if role is admin */}
        {profile?.role === 'admin' && (
          <Link
            to="/admin"
            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group overflow-hidden ${
              location.pathname.startsWith('/admin')
                ? 'text-teal-600 font-semibold bg-teal-50 border border-teal-500/20'
                : 'text-slate-600 hover:text-[#1d1d1f] hover:bg-slate-50 border border-transparent'
            }`}
          >
            {location.pathname.startsWith('/admin') && (
              <motion.div
                layoutId="active-nav-indicator"
                className="absolute left-0 w-1 h-6 bg-teal-500"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <Icons.ShieldAlert
              className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                location.pathname.startsWith('/admin') ? 'text-teal-500' : 'text-slate-400 group-hover:text-teal-500'
              }`}
            />
            <span>Admin Control</span>
            <Badge variant="default" className="ml-auto bg-teal-50 text-teal-600 border-teal-200">
              Admin
            </Badge>
          </Link>
        )}
      </nav>

      {/* User profile & actions at bottom */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        {profile && (
          <div className="flex items-center gap-3 mb-4 p-2 rounded-xl bg-white border border-slate-200/60 shadow-sm">
            <Avatar
              fallback={profile.avatarUrl && !profile.avatarUrl.includes('/') ? profile.avatarUrl : undefined}
              src={profile.avatarUrl && profile.avatarUrl.includes('/') ? profile.avatarUrl : undefined}
              alt={profile.displayName}
              size="md"
              status={profile.isOnline ? 'online' : 'offline'}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{profile.displayName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="default" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-600 border-slate-200">
                  Lvl {profile.level}
                </Badge>
                {profile.currentStreak > 0 && (
                  <span className="text-xs text-amber-500 font-medium flex items-center gap-0.5">
                    🔥 {profile.currentStreak}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-slate-500 hover:text-rose-600 hover:bg-rose-50 justify-start gap-3 rounded-xl"
          onClick={handleLogout}
        >
          <Icons.LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
