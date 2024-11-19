import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyAzpCKIMnGbRbaB5fN7BUTwvUh3h22g9kw",
  authDomain: "plant-calendar-cc46a.firebaseapp.com",
  projectId: "plant-calendar-cc46a",
  storageBucket: "plant-calendar-cc46a.firebasestorage.app",
  messagingSenderId: "245153145160",
  appId: "1:245153145160:web:f10300c83a8de11768d37d"
};

const app = initializeApp(firebaseConfig);

let auth;
try {
  // Try to get existing auth instance
  auth = getAuth(app);
} catch (error) {
  // If not initialized, create new auth instance with persistence
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

export { auth };
export const db = getFirestore(app);
export const functions = getFunctions(app);
