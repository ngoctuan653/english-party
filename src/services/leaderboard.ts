import { db } from '@/services/firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import type { UserProfile } from '@/types/user';

// ============================================
// Fetch Leaderboard Data
// ============================================

export async function fetchLeaderboard(): Promise<UserProfile[]> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('xp', 'desc'), limit(50));
  const snap = await getDocs(q);

  const list: UserProfile[] = [];
  snap.forEach((doc) => {
    list.push({ uid: doc.id, ...doc.data() } as UserProfile);
  });

  return list;
}
