import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AVATARS } from '@/utils/constants';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { ExamType } from '@/types/user';

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
