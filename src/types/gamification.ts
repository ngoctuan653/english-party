import { Timestamp } from 'firebase/firestore';

export interface DailyProgress {
  id: string;
  userId: string;
  date: string;
  questionsCompleted: number;
  wordsLearned: number;
  activeMinutes: number;
  listeningSetsCompleted: number;
  xpEarned: number;
  accuracy: number;
  missions: MissionProgress[];
  streakMaintained: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type MissionType = 'questions' | 'words' | 'minutes' | 'listening' | 'accuracy';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  target: number;
  xpReward: number;
  icon: string;
  isDaily: boolean;
  isActive: boolean;
}

export interface MissionProgress {
  missionId: string;
  type: MissionType;
  title: string;
  target: number;
  current: number;
  completed: boolean;
  completedAt?: Timestamp;
  xpReward: number;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  period: 'daily' | 'weekly' | 'monthly' | 'alltime';
  periodKey: string;
  xp: number;
  questionsCorrect: number;
  streak: number;
  rank?: number;
  updatedAt: Timestamp;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  type: 'streak' | 'xp_milestone' | 'mission_complete' | 'level_up' | 'study_complete';
  message: string;
  metadata: Record<string, unknown>;
  createdAt: Timestamp;
}

// XP Thresholds
export const XP_PER_CORRECT_ANSWER = 10;
export const XP_PER_WRONG_ANSWER = 2;
export const STREAK_BONUS_PER_DAY = 5;
export const STREAK_BONUS_CAP = 50;
export const PERFECT_QUIZ_BONUS = 100;
export const MISSION_XP_RANGE = { min: 50, max: 200 };

// Level calculation: level = floor(sqrt(xp / 100))
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100));
}

export function xpForLevel(level: number): number {
  return level * level * 100;
}

export function xpProgressInLevel(xp: number): { current: number; required: number; percentage: number } {
  const level = calculateLevel(xp);
  const currentLevelXp = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const current = xp - currentLevelXp;
  const required = nextLevelXp - currentLevelXp;
  return { current, required, percentage: Math.min((current / required) * 100, 100) };
}
