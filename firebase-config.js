import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

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
export default app;