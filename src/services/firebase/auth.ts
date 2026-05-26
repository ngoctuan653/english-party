import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { UserProfile } from '@/types/user';


const googleProvider = new GoogleAuthProvider();

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function createUserProfile(user: User, displayName?: string): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const existing = await getDoc(userRef);
  
  if (existing.exists()) {
    return existing.data() as UserProfile;
  }

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email || '',
    displayName: displayName || user.displayName || 'Student',
    avatarUrl: user.photoURL || null,
    role: 'user',
    xp: 0,
    level: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastStudyDate: '',
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    totalStudyMinutes: 0,
    vocabularyLearned: 0,
    targetExam: 'toeic',
    targetScore: 750,
    currentEstimatedScore: 0,
    friendIds: [],
    inviteCode: generateInviteCode(),
    isOnline: true,
    lastActiveAt: Timestamp.now(),
    dailyGoalMinutes: 30,
    notificationsEnabled: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(userRef, {
    ...profile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  });

  return profile;
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await createUserProfile(result.user);
  return result.user;
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function registerWithEmail(email: string, password: string, displayName: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  await createUserProfile(result.user, displayName);
  return result.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function onAuthChanged(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export function subscribeToUserProfile(uid: string, callback: (profile: UserProfile | null) => void) {
  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, (snap) => {
    callback(snap.exists() ? (snap.data() as UserProfile) : null);
  }, (error) => {
    console.error("Error subscribing to user profile:", error);
  });
}

