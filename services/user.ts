import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface UserLocation {
  country: string;
  city: string;
  // We can add more location details later if needed
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarId: number;
  location: UserLocation;
  setupComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function createUserProfile(
  uid: string,
  email: string,
  firstName: string,
  lastName: string
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  
  const newUser: Partial<UserProfile> = {
    uid,
    email,
    firstName,
    lastName,
    setupComplete: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(userRef, newUser);
}

export async function updateUserWelcomeInfo(
  uid: string,
  avatarId: number,
  location: UserLocation
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  
  await updateDoc(userRef, {
    avatarId,
    location,
    setupComplete: true,
    updatedAt: new Date(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    return null;
  }
  
  return userDoc.data() as UserProfile;
} 