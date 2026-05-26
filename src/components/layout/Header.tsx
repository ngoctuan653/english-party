import { useState, useRef, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { signOut } from '@/services/firebase/auth';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatTimeAgo } from '@/utils/helpers';
import { AnimatePresence, motion } from 'framer-motion';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, reset } = useAuthStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/study/vocabulary')) return 'Vocabulary Practice';
    if (path.startsWith('/study/listening')) return 'Listening Comprehension';
    if (path === '/study') return 'Study Station';
    if (path === '/missions') return 'Daily Missions';
    if (path === '/leaderboard') return 'Leaderboard';
    if (path === '/friends') return 'Friend Circle';
    if (path === '/profile') return 'Student Profile';
    if (path === '/settings') return 'Account Settings';
    if (path.startsWith('/admin')) {
      if (path === '/admin') return 'Admin Dashboard';
      if (path.includes('questions')) return 'Manage Questions';
      if (path.includes('vocabulary')) return 'Manage Vocabulary';
      if (path.includes('import')) return 'CSV Data Importer';
      return 'Administration';
    }
    return 'EnglishParty';
  };

  const handleLogout = async () => {
    try {
      await signOut();
      reset();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="h-16 hidden lg:flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 fixed top-0 right-0 left-64 z-20">
      {/* Title */}
      <h2 className="text-lg font-bold text-slate-800 tracking-wide">{getPageTitle()}</h2>

      {/* Actions */}
      <div className="flex items-center gap-6">
        {/* Streak & XP Quick Display */}
        {profile && (
          <div className="flex items-center gap-4 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200/60 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="text-sm">🔥</span>
              <span className="text-slate-800 font-bold">{profile.currentStreak}</span> days
            </span>
            <div className="w-px h-3 bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <span className="text-sm text-yellow-500">⭐</span>
              <span className="text-slate-800 font-bold">{profile.xp}</span> XP
            </span>
          </div>
        )}

        {/* Notifications Icon & Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all relative cursor-pointer"
          >
            <Icons.Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#FF3B30] text-white rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 text-slate-700"
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-[#0071E3] hover:underline font-medium cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">No new notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          notif.read
                            ? 'bg-transparent border-transparent opacity-60'
                            : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                          <span className="text-[9px] text-slate-400 shrink-0">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 pr-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-all text-left cursor-pointer"
          >
            <Avatar
              fallback={profile?.avatarUrl && !profile.avatarUrl.includes('/') ? profile.avatarUrl : undefined}
              src={profile?.avatarUrl && profile.avatarUrl.includes('/') ? profile.avatarUrl : undefined}
              alt={profile?.displayName || 'User'}
              size="sm"
            />
            <div className="hidden xl:block">
              <p className="text-xs font-semibold text-slate-800">{profile?.displayName}</p>
              <p className="text-[10px] text-slate-500">Level {profile?.level}</p>
            </div>
            <Icons.ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-3 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-3 bg-slate-50 border-b border-slate-100 text-center">
                  <p className="text-sm font-semibold text-slate-800">{profile?.displayName}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{profile?.email}</p>
                </div>
                <div className="p-1.5 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                  >
                    <Icons.User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
                  >
                    <Icons.Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>
                  <div className="h-px bg-slate-100 my-1.5" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-rose-500 hover:bg-rose-50 transition-all text-left cursor-pointer"
                  >
                    <Icons.LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
