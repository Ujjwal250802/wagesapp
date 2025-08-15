import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyCAzCnwNsUN4e40fd3SEfL5QECnvEWYCeI",
  authDomain: "dailywageapp.firebaseapp.com",
  projectId: "dailywageapp",
  storageBucket: "dailywageapp.firebasestorage.app",
  messagingSenderId: "812590718222",
  appId: "1:812590718222:web:7a0eeeaebc9b8212434b5f",
  measurementId: "G-3GFYK4H3EY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
try {
  // This will enable offline support
  if (typeof window !== 'undefined') {
    // Only enable in browser environment
    import('firebase/firestore').then(({ enableNetwork }) => {
      enableNetwork(db).catch(console.error);
    });
  }
} catch (error) {
  console.log('Offline persistence not available:', error);
}

export default app;