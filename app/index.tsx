import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase-config';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth/welcome');
      }
    });

    return unsubscribe;
  }, []);

  return null;
}