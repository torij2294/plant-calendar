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
  avatar: {
    id: number;
    name: string;
  };
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
    avatar: {
      id: 1,  // Default avatar
      name: 'default-avatar'
    },
    setupComplete: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(userRef, newUser);
}

export async function updateUserWelcomeInfo(
  uid: string,
  avatarId: number,
  location: UserLocation,
  firstName?: string,
  lastName?: string
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  
  await updateDoc(userRef, {
    avatar: avatarId,
    location,
    firstName,
    lastName,
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

export async function updateUserProfile(userId: string, data: {
  firstName?: string;
  lastName?: string;
  avatar?: number;
  country?: string;
  city?: string;
}) {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, data);
} 