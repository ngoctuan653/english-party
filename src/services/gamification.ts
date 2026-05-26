/**
 * Gamification Service
 * Handles XP calculation, streak management, mission generation, and level progression.
 */

import { doc, getDoc, setDoc, updateDoc, serverTimestamp, increment, Timestamp } from 'firebase/firestore';
import { db } from '@/services/firebase/config';
import type { UserProfile } from '@/types/user';
import type { DailyProgress, Mission, MissionProgress } from '@/types/gamification';
import {
  XP_PER_CORRECT_ANSWER,
  XP_PER_WRONG_ANSWER,
  STREAK_BONUS_PER_DAY,
  STREAK_BONUS_CAP,
  PERFECT_QUIZ_BONUS,
  calculateLevel,
} from '@/types/gamification';
import { getTodayDateString } from '@/utils/helpers';
import { STREAK_REQUIREMENTS } from '@/utils/constants';

// ============================================
// XP Calculation
// ============================================

export function calculateSessionXP(
  correctAnswers: number,
  wrongAnswers: number,
  currentStreak: number,
  isPerfect: boolean
): { baseXP: number; streakBonus: number; perfectBonus: number; totalXP: number } {
  const baseXP = correctAnswers * XP_PER_CORRECT_ANSWER + wrongAnswers * XP_PER_WRONG_ANSWER;
  const streakBonus = Math.min(currentStreak * STREAK_BONUS_PER_DAY, STREAK_BONUS_CAP);
  const perfectBonus = isPerfect && correctAnswers >= 5 ? PERFECT_QUIZ_BONUS : 0;
  const totalXP = baseXP + streakBonus + perfectBonus;

  return { baseXP, streakBonus, perfectBonus, totalXP };
}

// ============================================
// Streak Management
// ============================================

export async function checkAndUpdateStreak(userId: string): Promise<{
  newStreak: number;
  streakBroken: boolean;
  streakMaintained: boolean;
}> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return { newStreak: 0, streakBroken: false, streakMaintained: false };
  }

  const profile = userSnap.data() as UserProfile;
  const today = getTodayDateString();
  const lastStudy = profile.lastStudyDate;

  if (lastStudy === today) {
    // Already studied today
    return { newStreak: profile.currentStreak, streakBroken: false, streakMaintained: true };
  }

  // Check if yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastStudy === yesterdayStr) {
    // Streak continues
    const newStreak = profile.currentStreak + 1;
    const longestStreak = Math.max(newStreak, profile.longestStreak);
    
    await updateDoc(userRef, {
      currentStreak: newStreak,
      longestStreak,
      lastStudyDate: today,
      updatedAt: serverTimestamp(),
    });

    return { newStreak, streakBroken: false, streakMaintained: true };
  }

  // Streak broken (or first study)
  const newStreak = 1;
  await updateDoc(userRef, {
    currentStreak: newStreak,
    lastStudyDate: today,
    updatedAt: serverTimestamp(),
  });

  return {
    newStreak,
    streakBroken: lastStudy !== '',
    streakMaintained: false,
  };
}

export function isStreakAtRisk(lastStudyDate: string): boolean {
  if (!lastStudyDate) return false;
  const today = getTodayDateString();
  return lastStudyDate !== today;
}

// ============================================
// Daily Progress
// ============================================

export async function getDailyProgress(userId: string): Promise<DailyProgress | null> {
  const today = getTodayDateString();
  const progressRef = doc(db, 'daily_progress', `${userId}_${today}`);
  const snap = await getDoc(progressRef);
  return snap.exists() ? (snap.data() as DailyProgress) : null;
}

export async function updateDailyProgress(
  userId: string,
  updates: {
    questionsCompleted?: number;
    wordsLearned?: number;
    activeMinutes?: number;
    listeningSetsCompleted?: number;
    xpEarned?: number;
    accuracy?: number;
  }
): Promise<void> {
  const today = getTodayDateString();
  const progressRef = doc(db, 'daily_progress', `${userId}_${today}`);
  const snap = await getDoc(progressRef);

  if (snap.exists()) {
    const data = snap.data();
    await updateDoc(progressRef, {
      questionsCompleted: (data.questionsCompleted || 0) + (updates.questionsCompleted || 0),
      wordsLearned: (data.wordsLearned || 0) + (updates.wordsLearned || 0),
      activeMinutes: (data.activeMinutes || 0) + (updates.activeMinutes || 0),
      listeningSetsCompleted: (data.listeningSetsCompleted || 0) + (updates.listeningSetsCompleted || 0),
      xpEarned: (data.xpEarned || 0) + (updates.xpEarned || 0),
      updatedAt: serverTimestamp(),
    });
  } else {
    const missions = generateDailyMissions();
    const newProgress: Omit<DailyProgress, 'createdAt' | 'updatedAt'> & { createdAt: ReturnType<typeof serverTimestamp>; updatedAt: ReturnType<typeof serverTimestamp> } = {
      id: `${userId}_${today}`,
      userId,
      date: today,
      questionsCompleted: updates.questionsCompleted || 0,
      wordsLearned: updates.wordsLearned || 0,
      activeMinutes: updates.activeMinutes || 0,
      listeningSetsCompleted: updates.listeningSetsCompleted || 0,
      xpEarned: updates.xpEarned || 0,
      accuracy: updates.accuracy || 0,
      missions: missions.map((m) => ({
        missionId: m.id,
        type: m.type,
        title: m.title,
        target: m.target,
        current: 0,
        completed: false,
        xpReward: m.xpReward,
      })),
      streakMaintained: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(progressRef, newProgress);
  }
}

export async function updateMissionProgress(
  userId: string,
  missionType: string,
  progressAmount: number
): Promise<MissionProgress | null> {
  const today = getTodayDateString();
  const progressRef = doc(db, 'daily_progress', `${userId}_${today}`);
  const snap = await getDoc(progressRef);

  if (!snap.exists()) return null;

  const data = snap.data() as DailyProgress;
  let completedMission: MissionProgress | null = null;

  const updatedMissions = data.missions.map((mission) => {
    if (mission.type === missionType && !mission.completed) {
      const newCurrent = mission.current + progressAmount;
      const completed = newCurrent >= mission.target;
      
      if (completed && !mission.completed) {
        completedMission = { ...mission, current: newCurrent, completed, completedAt: Timestamp.now() };
      }

      return {
        ...mission,
        current: newCurrent,
        completed,
        ...(completed ? { completedAt: Timestamp.now() } : {}),
      };
    }
    return mission;
  });

  await updateDoc(progressRef, {
    missions: updatedMissions,
    updatedAt: serverTimestamp(),
  });

  return completedMission;
}

// ============================================
// Mission Generation
// ============================================

const DAILY_MISSION_TEMPLATES: Mission[] = [
  {
    id: 'daily_questions',
    type: 'questions',
    title: 'Answer 30 Questions',
    description: 'Complete 30 practice questions today',
    target: 30,
    xpReward: 100,
    icon: '📝',
    isDaily: true,
    isActive: true,
  },
  {
    id: 'daily_words',
    type: 'words',
    title: 'Learn 20 Words',
    description: 'Study 20 new vocabulary words',
    target: 20,
    xpReward: 80,
    icon: '📚',
    isDaily: true,
    isActive: true,
  },
  {
    id: 'daily_minutes',
    type: 'minutes',
    title: 'Study 15 Minutes',
    description: 'Spend 15 minutes actively studying',
    target: 15,
    xpReward: 60,
    icon: '⏱️',
    isDaily: true,
    isActive: true,
  },
  {
    id: 'daily_listening',
    type: 'listening',
    title: 'Complete 1 Listening Set',
    description: 'Finish a full listening practice set',
    target: 1,
    xpReward: 120,
    icon: '🎧',
    isDaily: true,
    isActive: true,
  },
];

export function generateDailyMissions(): Mission[] {
  return DAILY_MISSION_TEMPLATES;
}

// ============================================
// Award XP
// ============================================

export async function awardXP(userId: string, xpAmount: number): Promise<{ newXP: number; newLevel: number; leveledUp: boolean }> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return { newXP: 0, newLevel: 0, leveledUp: false };
  }

  const profile = userSnap.data() as UserProfile;
  const oldLevel = calculateLevel(profile.xp);
  const newXP = profile.xp + xpAmount;
  const newLevel = calculateLevel(newXP);
  const leveledUp = newLevel > oldLevel;

  await updateDoc(userRef, {
    xp: increment(xpAmount),
    level: newLevel,
    updatedAt: serverTimestamp(),
  });

  return { newXP, newLevel, leveledUp };
}

// ============================================
// Check streak maintenance requirements
// ============================================

export function hasMetStreakRequirements(progress: DailyProgress | null): boolean {
  if (!progress) return false;
  return (
    progress.questionsCompleted >= STREAK_REQUIREMENTS.minQuestions ||
    progress.activeMinutes >= STREAK_REQUIREMENTS.minActiveMinutes
  );
}
