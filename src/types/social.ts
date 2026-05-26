import { Timestamp } from 'firebase/firestore';

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';

export interface Friendship {
  id: string;
  userIds: [string, string];
  status: FriendshipStatus;
  requestedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FriendInfo {
  uid: string;
  displayName: string;
  avatarUrl: string | null;
  isOnline: boolean;
  lastActiveAt: Timestamp | null;
  currentStreak: number;
  xp: number;
  level: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'friend_request' | 'streak_warning' | 'daily_reminder' | 'achievement' | 'friend_activity';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Timestamp;
}
