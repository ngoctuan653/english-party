import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { onAuthChanged, getUserProfile, createUserProfile, subscribeToUserProfile } from '@/services/firebase/auth';

export function useAuth() {
  const { user, profile, isLoading, isAuthenticated, setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthChanged(async (firebaseUser) => {
      try {
        setUser(firebaseUser);
        if (firebaseUser) {
          // Check if profile exists, if not, create it
          let userProfile = await getUserProfile(firebaseUser.uid);
          if (!userProfile) {
            try {
              userProfile = await createUserProfile(firebaseUser);
            } catch (createErr) {
              console.error('Failed to auto-create user profile:', createErr);
            }
          }

          // Unsubscribe from any previous profile listener
          if (unsubscribeProfile) {
            unsubscribeProfile();
          }

          // Subscribe to profile changes in real time
          unsubscribeProfile = subscribeToUserProfile(firebaseUser.uid, (updatedProfile) => {
            setProfile(updatedProfile);
            setLoading(false);
          });
        } else {
          setProfile(null);
          if (unsubscribeProfile) {
            unsubscribeProfile();
            unsubscribeProfile = null;
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in auth state change listener:', err);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) {
        unsubscribeProfile();
      }
    };
  }, [setUser, setProfile, setLoading]);

  return { user, profile, isLoading, isAuthenticated };
}


