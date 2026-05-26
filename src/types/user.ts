import { Timestamp } from 'firebase/firestore';

export type UserRole = 'user' | 'admin';
export type ExamType = 'toeic' | 'ielts' | 'jlpt' | 'sat' | 'custom';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  role: UserRole;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  totalStudyMinutes: number;
  vocabularyLearned: number;
  targetExam: ExamType;
  targetScore: number;
  currentEstimatedScore: number;
  friendIds: string[];
  inviteCode: string;
  isOnline: boolean;
  lastActiveAt: Timestamp | null;
  dailyGoalMinutes: number;
  notificationsEnabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  accuracy: number;
  totalQuestions: number;
  studyMinutes: number;
}
