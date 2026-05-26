import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import {
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  fetchFriends,
  fetchPendingRequests,
} from '@/services/friends';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'react-hot-toast';
import type { FriendInfo } from '@/types/social';
import { motion, AnimatePresence } from 'framer-motion';
import * as Icons from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function FriendsPage() {
  const { profile, setProfile } = useAuthStore();
  const inviteCode = profile?.inviteCode ?? '';
  const [friendCode, setFriendCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Friends states
  const [friends, setFriends] = useState<FriendInfo[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);

  async function loadSocialData() {
    if (!profile?.uid) return;
    try {
      setLoading(true);
      // 1. Fetch pending incoming requests
      const reqs = await fetchPendingRequests(profile.uid);
      setPendingRequests(reqs);

      // 2. Fetch accepted friends details
      const list = await fetchFriends(profile.friendIds || []);
      setFriends(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load friends list.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSocialData();
  }, [profile?.uid, profile?.friendIds]);

  const handleCopy = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success('Invite code copied to clipboard! 📋');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCode.trim()) return;
    if (!profile?.uid) return;

    setSendingRequest(true);
    try {
      await sendFriendRequest(profile.uid, friendCode.trim());
      toast.success('Friend request sent successfully! 📨');
      setFriendCode('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send request');
    } finally {
      setSendingRequest(false);
    }
  };

  const handleAccept = async (targetId: string) => {
    if (!profile?.uid) return;
    try {
      await acceptFriendRequest(profile.uid, targetId);
      toast.success('Friend request accepted! 🎉');
      // Sync local profile state friendIds list
      if (profile) {
        setProfile({
          ...profile,
          friendIds: [...(profile.friendIds || []), targetId],
        });
      }
      loadSocialData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to accept request');
    }
  };

  const handleDecline = async (targetId: string) => {
    if (!profile?.uid) return;
    try {
      await declineFriendRequest(profile.uid, targetId);
      toast.success('Friend request declined.');
      loadSocialData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to decline request');
    }
  };

  const onlineFriends = friends.filter((f) => f.isOnline);

  return (
    <div className="space-y-6 pb-8 text-slate-800">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">
          <span className="bg-gradient-to-r from-blue-600 to-[#0071E3] bg-clip-text text-transparent">
            Friend Circle
          </span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Study together, track streaks, and compete with friends
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Online Friends */}
          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-800">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Online Now ({onlineFriends.length})
            </h2>
            {loading ? (
              <div className="flex gap-4">
                <Skeleton className="h-10 w-28 rounded-xl" />
                <Skeleton className="h-10 w-28 rounded-xl" />
              </div>
            ) : onlineFriends.length === 0 ? (
              <p className="text-xs text-slate-500 py-2">No friends are currently online. Invite some to join!</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {onlineFriends.map((friend) => (
                  <div
                    key={friend.uid}
                    className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/40 px-4 py-3 hover:bg-emerald-50/80 transition-colors"
                  >
                    <Avatar
                      fallback={friend.avatarUrl && !friend.avatarUrl.includes('/') ? friend.avatarUrl : undefined}
                      src={friend.avatarUrl && friend.avatarUrl.includes('/') ? friend.avatarUrl : undefined}
                      alt={friend.displayName}
                      size="sm"
                      status="online"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-none">{friend.displayName}</p>
                      <p className="text-[9px] text-slate-500 mt-1">Lvl {friend.level}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* All Friends List */}
          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-slate-800">All Friends ({friends.length})</h2>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-14 w-full rounded-xl" />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-6">
                <Icons.Users className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-600">Your friends list is empty.</p>
                <p className="text-xs text-slate-400 mt-1">Share your invite code to start learning together!</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-2.5"
              >
                {friends.map((friend) => (
                  <motion.div
                    key={friend.uid}
                    variants={itemVariants}
                    className="flex items-center gap-4 rounded-xl border border-slate-200/60 bg-white p-4 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    <Avatar
                      fallback={friend.avatarUrl && !friend.avatarUrl.includes('/') ? friend.avatarUrl : undefined}
                      src={friend.avatarUrl && friend.avatarUrl.includes('/') ? friend.avatarUrl : undefined}
                      alt={friend.displayName}
                      size="md"
                      status={friend.isOnline ? 'online' : 'offline'}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{friend.displayName}</p>
                      <div className="flex items-center gap-2.5 mt-1 text-[10px] text-slate-500 font-semibold">
                        <Badge variant="purple" className="text-[9px]">Lvl {friend.level}</Badge>
                        {friend.currentStreak > 0 && (
                          <span className="text-amber-600">🔥 {friend.currentStreak} day streak</span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold tabular-nums text-slate-600 shrink-0">
                      {friend.xp.toLocaleString()} XP
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Invite Code */}
          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Icons.Share2 className="w-4 h-4 text-[#0071E3]" />
              Your Invite Code
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Share this code with friends to connect and study together.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 rounded-xl border border-blue-200 bg-blue-50/50 px-4 py-2.5 text-center font-mono text-base font-bold tracking-[0.2em] text-[#0071E3]">
                {inviteCode}
              </div>
              <Button
                onClick={handleCopy}
                variant="secondary"
                className="shrink-0 h-11 px-4 text-xs font-semibold text-[#0071E3] bg-blue-50 border border-blue-200 hover:bg-blue-100"
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </Card>

          {/* Add Friend Form */}
          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <Icons.UserPlus className="w-4 h-4 text-[#0071E3]" />
              Add Friend
            </h3>
            <form onSubmit={handleAddFriend} className="flex gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={friendCode}
                  onChange={(e) => setFriendCode(e.target.value.toUpperCase())}
                  placeholder="Invite Code..."
                  maxLength={6}
                  required
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <Button
                type="submit"
                isLoading={sendingRequest}
                className="shrink-0 h-11 px-5 bg-[#0071E3] hover:bg-[#0077ED] text-xs font-bold text-white"
              >
                Send
              </Button>
            </form>
          </Card>

          {/* Incoming Requests */}
          <Card className="p-5 bg-white border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Icons.Inbox className="w-4 h-4 text-emerald-500" />
              Friend Requests ({pendingRequests.length})
            </h3>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            ) : pendingRequests.length === 0 ? (
              <p className="text-xs text-slate-500">No incoming friend requests.</p>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((req) => (
                  <div
                    key={req.uid}
                    className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-slate-50/50 p-3"
                  >
                    <Avatar
                      fallback={req.avatarUrl && !req.avatarUrl.includes('/') ? req.avatarUrl : undefined}
                      src={req.avatarUrl && req.avatarUrl.includes('/') ? req.avatarUrl : undefined}
                      alt={req.displayName}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{req.displayName}</p>
                      <p className="text-[9px] text-slate-500">Lvl {req.level}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                         type="button"
                        onClick={() => handleAccept(req.uid)}
                        className="rounded-lg bg-emerald-100 p-1.5 px-2.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-200 transition-colors cursor-pointer"
                      >
                        Accept
                      </button>
                      <button
                         type="button"
                        onClick={() => handleDecline(req.uid)}
                        className="rounded-lg bg-slate-100 p-1.5 px-2 text-[10px] font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
