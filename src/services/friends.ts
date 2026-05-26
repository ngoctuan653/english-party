import { db } from '@/services/firebase/config';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import type { Friendship, FriendInfo } from '@/types/social';
import type { UserProfile } from '@/types/user';

// ============================================
// Find User by Invite Code
// ============================================

export async function findUserByInviteCode(inviteCode: string): Promise<UserProfile | null> {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('inviteCode', '==', inviteCode.trim().toUpperCase()));
  const snap = await getDocs(q);

  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { uid: doc.id, ...doc.data() } as UserProfile;
}

// ============================================
// Friend Request Operations
// ============================================

export async function sendFriendRequest(currentUserId: string, targetInviteCode: string): Promise<void> {
  const targetUser = await findUserByInviteCode(targetInviteCode);
  if (!targetUser) {
    throw new Error('No student found with this invite code.');
  }

  if (targetUser.uid === currentUserId) {
    throw new Error('You cannot add yourself.');
  }

  const friendshipId = [currentUserId, targetUser.uid].sort().join('_');
  const friendshipRef = doc(db, 'friendships', friendshipId);
  const snap = await getDoc(friendshipRef);

  if (snap.exists()) {
    const existing = snap.data() as Friendship;
    if (existing.status === 'accepted') {
      throw new Error('You are already friends.');
    }
    if (existing.status === 'pending') {
      if (existing.requestedBy === currentUserId) {
        throw new Error('Friend request already sent.');
      } else {
        throw new Error('This user has already sent you a request. Accept it in requests.');
      }
    }
  }

  const newRequest = {
    id: friendshipId,
    userIds: [currentUserId, targetUser.uid].sort() as [string, string],
    status: 'pending',
    requestedBy: currentUserId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(friendshipRef, newRequest);
}

export async function acceptFriendRequest(currentUserId: string, targetId: string): Promise<void> {
  const friendshipId = [currentUserId, targetId].sort().join('_');
  const friendshipRef = doc(db, 'friendships', friendshipId);

  // Update status to accepted
  await updateDoc(friendshipRef, {
    status: 'accepted',
    updatedAt: serverTimestamp(),
  });

  // Add each other to friendIds list
  const currentUserRef = doc(db, 'users', currentUserId);
  const targetUserRef = doc(db, 'users', targetId);

  await updateDoc(currentUserRef, {
    friendIds: arrayUnion(targetId),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(targetUserRef, {
    friendIds: arrayUnion(currentUserId),
    updatedAt: serverTimestamp(),
  });
}

export async function declineFriendRequest(currentUserId: string, targetId: string): Promise<void> {
  const friendshipId = [currentUserId, targetId].sort().join('_');
  const friendshipRef = doc(db, 'friendships', friendshipId);
  await deleteDoc(friendshipRef);
}

// ============================================
// Fetch Friend Data
// ============================================

export async function fetchFriends(friendIds: string[]): Promise<FriendInfo[]> {
  if (friendIds.length === 0) return [];
  const list: FriendInfo[] = [];

  // Query each friend profile
  for (const id of friendIds) {
    const userRef = doc(db, 'users', id);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const u = snap.data() as UserProfile;
      list.push({
        uid: u.uid,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        isOnline: u.isOnline,
        lastActiveAt: u.lastActiveAt,
        currentStreak: u.currentStreak,
        xp: u.xp,
        level: u.level,
      });
    }
  }

  return list;
}

export async function fetchPendingRequests(userId: string): Promise<FriendInfo[]> {
  const friendshipsRef = collection(db, 'friendships');
  const q = query(
    friendshipsRef,
    where('userIds', 'array-contains', userId),
    where('status', '==', 'pending')
  );

  const snap = await getDocs(q);
  const requestorIds: string[] = [];

  snap.forEach((doc) => {
    const data = doc.data() as Friendship;
    if (data.requestedBy !== userId) {
      const otherId = data.userIds.find((id) => id !== userId);
      if (otherId) requestorIds.push(otherId);
    }
  });

  if (requestorIds.length === 0) return [];
  return fetchFriends(requestorIds);
}
