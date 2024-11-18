import { initializeApp } from 'firebase/app';
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Functions
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
