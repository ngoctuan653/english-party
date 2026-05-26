import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationStore } from '@/stores/notificationStore';
import { Avatar } from '@/components/ui/Avatar';
import { formatTimeAgo } from '@/utils/helpers';
import { AnimatePresence, motion } from 'framer-motion';

export function MobileHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuthStore();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/study/vocabulary')) return 'Vocab';
    if (path.startsWith('/study/listening')) return 'Listening';
    if (path === '/study') return 'Study';
    if (path === '/missions') return 'Missions';
    if (path === '/leaderboard') return 'Leaderboard';
    if (path === '/friends') return 'Friends';
    if (path === '/profile') return 'Profile';
    if (path === '/settings') return 'Settings';
    if (path.startsWith('/admin')) return 'Admin';
    return 'EnglishParty';
  };

  const showBackButton = () => {
    const path = location.pathname;
    return path.startsWith('/study/') || path === '/settings' || path.startsWith('/admin/');
  };

  return (
    <header 
      className="lg:hidden flex items-center justify-between px-4 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 fixed top-0 inset-x-0 z-20"
    >
      {/* Left side: Back or Logo */}
      <div className="flex items-center gap-2">
        {showBackButton() ? (
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 active:bg-slate-100 cursor-pointer"
          >
            <Icons.ChevronLeft className="w-5 h-5" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🎉</span>
          </div>
        )}
        <h1 className="text-base font-bold text-slate-800 tracking-wide">{getPageTitle()}</h1>
      </div>

      {/* Right side: Streak & Notifications */}
      <div className="flex items-center gap-3">
        {profile && profile.currentStreak > 0 && (
          <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full text-xs font-semibold text-amber-500">
            <span>🔥</span>
            <span>{profile.currentStreak}</span>
          </div>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-500 active:bg-slate-100 transition-all relative cursor-pointer"
          >
            <Icons.Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF3B30] text-white rounded-full flex items-center justify-center text-[9px] font-bold ring-2 ring-white animate-pulse">
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
                className="absolute right-0 mt-2.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 text-slate-700"
              >
                <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-slate-100">
                  <span className="font-semibold text-xs text-slate-800">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] text-[#0071E3] font-medium cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2 pr-0.5 scrollbar-thin">
                  {notifications.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-xs">No notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer ${
                          notif.read
                            ? 'bg-transparent border-transparent opacity-60'
                            : 'bg-slate-50 border-slate-100 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <p className="text-[10px] font-semibold text-slate-800">{notif.title}</p>
                          <span className="text-[8px] text-slate-400 shrink-0">
                            {formatTimeAgo(notif.createdAt)}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile icon */}
        <div onClick={() => navigate('/profile')} className="cursor-pointer">
          <Avatar
            fallback={profile?.avatarUrl && !profile.avatarUrl.includes('/') ? profile.avatarUrl : undefined}
            src={profile?.avatarUrl && profile.avatarUrl.includes('/') ? profile.avatarUrl : undefined}
            alt={profile?.displayName || 'User'}
            size="sm"
          />
        </div>
      </div>
    </header>
  );
}
