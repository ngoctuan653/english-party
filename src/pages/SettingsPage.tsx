import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { doc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db, getMessagingInstance, getToken, onMessage } from '@/services/firebase/config';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AVATARS } from '@/utils/constants';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { ExamType } from '@/types/user';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

export default function SettingsPage() {
  const { profile, setProfile } = useAuthStore();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [targetExam, setTargetExam] = useState<ExamType>(profile?.targetExam || 'toeic');
  const [targetScore, setTargetScore] = useState(profile?.targetScore || 750);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(profile?.dailyGoalMinutes || 30);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl || '🦊');
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    profile?.notificationsEnabled !== false
  );
  const [saving, setSaving] = useState(false);

  // Detect iOS and standalone mode
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || (navigator as any).standalone === true;

  // Get iOS version
  const iOSVersion = (() => {
    if (!isIOS) return null;
    const match = navigator.userAgent.match(/OS (\d+)_(\d+)/);
    return match ? parseInt(match[1]) : null;
  })();

  // iOS needs: standalone mode + iOS 16.4+
  const iOSNeedsHomescreen = isIOS && !isStandalone;
  const iOSUnsupported = isIOS && isStandalone && iOSVersion !== null && iOSVersion < 16;

  // Push notification states
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const [pushSupported, setPushSupported] = useState(true);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [tokenCopied, setTokenCopied] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  // Check current push notification status on mount + load token if already granted
  useEffect(() => {
    if (iOSNeedsHomescreen || iOSUnsupported) {
      setPushSupported(false);
      return;
    }
    if (typeof Notification === 'undefined') {
      setPushSupported(false);
      return;
    }
    const alreadyGranted = Notification.permission === 'granted';
    setPushEnabled(alreadyGranted);

    // If already granted, fetch token silently to show in UI
    if (alreadyGranted) {
      (async () => {
        try {
          const messaging = await getMessagingInstance();
          if (messaging) {
            // Explicitly register service worker to avoid conflicts with Vite PWA sw.js
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
            const token = await getToken(messaging, {
              vapidKey: VAPID_KEY,
              serviceWorkerRegistration: registration
            });
            setFcmToken(token);
          }
        } catch (err) {
          console.warn('Could not load FCM token:', err);
          setTokenError(err instanceof Error ? err.message : String(err));
        }
      })();
    }
  }, []);


  // Listen for foreground messages
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    (async () => {
      const messaging = await getMessagingInstance();
      if (messaging) {
        unsubscribe = onMessage(messaging, (payload) => {
          console.log('Foreground message:', payload);
          toast(payload.notification?.body || 'New notification!', {
            icon: '🔔',
          });
        });
      }
    })();

    return () => unsubscribe?.();
  }, []);

  const handleTogglePush = async () => {
    if (!profile) return;

    // iOS in browser → guide to add homescreen first
    if (iOSNeedsHomescreen) {
      toast('Trên iOS, hãy Add to Home Screen trước rồi mở app từ màn hình chính để bật thông báo.', {
        icon: '📱',
        duration: 5000,
      });
      return;
    }

    // iOS too old
    if (iOSUnsupported) {
      toast.error('Push notifications yêu cầu iOS 16.4 trở lên.');
      return;
    }

    // If already granted, we can't revoke via JS — guide user
    if (pushEnabled) {
      toast('Để tắt, vào cài đặt trình duyệt và chặn thông báo cho trang này.', { icon: 'ℹ️' });
      return;
    }

    setPushLoading(true);
    setTokenError(null);
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        const messaging = await getMessagingInstance();
        if (!messaging) {
          toast.error('Push notifications không được hỗ trợ trên trình duyệt này.');
          setPushLoading(false);
          return;
        }

        // Explicitly register service worker to avoid conflicts with Vite PWA sw.js
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });
        console.log('FCM Token:', token);

        // Save token to user's Firestore doc
        const userRef = doc(db, 'users', profile.uid);
        await updateDoc(userRef, {
          fcmTokens: arrayUnion(token),
          updatedAt: serverTimestamp(),
        });

        setPushEnabled(true);
        setFcmToken(token);
        toast.success('Đã bật Push Notifications! 🔔');
      } else if (permission === 'denied') {
        toast.error('Quyền thông báo bị từ chối. Kiểm tra cài đặt trình duyệt.');
      } else {
        toast('Bạn đã bỏ qua yêu cầu thông báo.', { icon: '⚠️' });
      }
    } catch (err) {
      console.error('Push notification error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      setTokenError(errMsg);
      toast.error('Không thể bật thông báo: ' + errMsg);
    } finally {
      setPushLoading(false);
    }
  };


  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-400">Please sign in to modify settings.</p>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error('Display name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const userRef = doc(db, 'users', profile.uid);
      const updates = {
        displayName,
        targetExam,
        targetScore: Number(targetScore),
        dailyGoalMinutes: Number(dailyGoalMinutes),
        avatarUrl,
        notificationsEnabled,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userRef, updates);

      // Sync Zustand profile
      setProfile({
        ...profile,
        ...updates,
        updatedAt: updates.updatedAt as any,
      });

      toast.success('Settings updated successfully! 🎉');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8 text-slate-800">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          <span className="bg-gradient-to-r from-blue-600 to-[#0071E3] bg-clip-text text-transparent">
            Account Settings
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Customize your profile, target scores, and study notifications
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card & Avatar selection */}
        <Card className="p-6 space-y-6">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Icons.User className="w-5 h-5 text-[#0071E3]" />
            Profile Customization
          </h2>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-slate-600">Choose Avatar</label>
            <div className="flex flex-wrap gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarUrl(emoji)}
                  className={`text-3xl p-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                    avatarUrl === emoji
                      ? 'bg-[#0071E3]/10 border border-[#0071E3] scale-110 shadow-sm shadow-[#0071E3]/10'
                      : 'border border-transparent bg-transparent hover:bg-slate-100 hover:scale-105'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Anh Tuan"
              required
            />
            <Input
              label="Email Address"
              value={profile.email}
              disabled
              placeholder="user@example.com"
              className="opacity-60 cursor-not-allowed text-slate-500"
            />
          </div>
        </Card>

        {/* Study Goals Card */}
        <Card className="p-6 space-y-6">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Icons.Target className="w-5 h-5 text-blue-500" />
            Study Goals
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Exam selector */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-600">Target Exam</label>
              <select
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value as ExamType)}
                className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0071E3]/25 focus:border-[#0071E3] hover:border-slate-300"
              >
                <option value="toeic" className="bg-white text-slate-800">TOEIC</option>
                <option value="ielts" className="bg-white text-slate-800">IELTS</option>
                <option value="jlpt" className="bg-white text-slate-800">JLPT</option>
                <option value="sat" className="bg-white text-slate-800">SAT</option>
              </select>
            </div>

            {/* Target score */}
            <Input
              label="Target Score"
              type="number"
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              placeholder="750"
            />

            {/* Daily study time */}
            <Input
              label="Daily Goal (Minutes)"
              type="number"
              value={dailyGoalMinutes}
              onChange={(e) => setDailyGoalMinutes(Number(e.target.value))}
              placeholder="30"
            />
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6 space-y-6">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Icons.Bell className="w-5 h-5 text-emerald-500" />
            Preferences
          </h2>

          {/* In-app notifications toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">In-App Notifications</p>
              <p className="text-xs text-slate-500">Receive alert updates on streak warnings and friend requests</p>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 cursor-pointer ${
                notificationsEnabled ? 'bg-[#34C759]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Push notifications toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                Push Notifications
                {pushEnabled && (
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 rounded-full">
                    Active
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-500">
                {iOSNeedsHomescreen
                  ? 'Cần Add to Home Screen trên iOS trước'
                  : iOSUnsupported
                    ? 'Yêu cầu iOS 16.4 trở lên'
                    : pushSupported
                      ? 'Nhận thông báo kể cả khi app đóng'
                      : 'Không hỗ trợ trên trình duyệt này'}
              </p>
            </div>
            <button
              type="button"
              disabled={!pushSupported || pushLoading || iOSNeedsHomescreen || iOSUnsupported}
              onClick={handleTogglePush}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-all duration-300 ${
                !pushSupported || pushLoading || iOSNeedsHomescreen || iOSUnsupported
                  ? 'bg-slate-200 cursor-not-allowed opacity-50'
                  : pushEnabled
                    ? 'bg-[#34C759] cursor-pointer'
                    : 'bg-slate-300 cursor-pointer'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                  pushEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* iOS: needs Add to Homescreen */}
          {iOSNeedsHomescreen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200/80"
            >
              <Icons.Smartphone className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-bold text-amber-800">Cần Add to Home Screen trước</p>
                <p className="text-xs text-amber-700">
                  iOS chỉ hỗ trợ Push Notifications khi app được cài từ màn hình chính (iOS 16.4+).
                </p>
                <ol className="text-xs text-amber-700 space-y-1 list-none">
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                    Bấm nút <Icons.Share className="inline w-3.5 h-3.5 mx-0.5" /> <strong>Share</strong> trên Safari
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                    Chọn <strong>"Add to Home Screen"</strong>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                    Mở app từ màn hình chính → vào Settings → bật thông báo
                  </li>
                </ol>
              </div>
            </motion.div>
          )}

          {/* iOS standalone but old version */}
          {iOSUnsupported && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-200/60"
            >
              <Icons.AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-red-700">iOS quá cũ</p>
                <p className="text-xs text-red-600">
                  Push Notifications trên iOS yêu cầu <strong>iOS 16.4 trở lên</strong>. Hãy cập nhật iOS để sử dụng tính năng này.
                </p>
              </div>
            </motion.div>
          )}

          {/* FCM Token display for testing */}
          {fcmToken && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                  <Icons.Key className="w-3.5 h-3.5" />
                  FCM Token (để test)
                </p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(fcmToken);
                    setTokenCopied(true);
                    setTimeout(() => setTokenCopied(false), 2000);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  {tokenCopied ? (
                    <><Icons.Check className="w-3 h-3 text-emerald-500" /> Đã copy</>
                  ) : (
                    <><Icons.Copy className="w-3 h-3" /> Copy</>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-mono break-all leading-relaxed select-all">
                {fcmToken}
              </p>
              <p className="text-[10px] text-slate-400">
                Dán token này vào <strong>Firebase Console → Messaging → Send test message</strong>
              </p>
            </motion.div>
          )}

          {/* FCM Token Error display */}
          {tokenError && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-1 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-800"
            >
              <p className="text-xs font-bold flex items-center gap-1.5">
                <Icons.AlertTriangle className="w-4 h-4 text-rose-500" />
                Lỗi lấy FCM Token
              </p>
              <p className="text-[11px] font-mono leading-relaxed break-all">
                {tokenError}
              </p>
            </motion.div>
          )}
        </Card>



        {/* Action Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            isLoading={saving}
            className="px-8 font-semibold"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}


