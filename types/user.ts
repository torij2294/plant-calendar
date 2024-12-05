import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { UserProfile, UserLocation, FirestoreUserData } from '@/types';
import { serverTimestamp } from 'firebase/firestore';

export async function createUserProfile(
  uid: string,
  email: string,
  firstName: string,
  lastName: string
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  
  const newUser: FirestoreUserData = {
    profile: {
      uid,
      email,
      firstName,
      lastName,
      avatar: 1,  // Default avatar ID
      location: {
        city: '',
        country: '',
        latitude: null,
        longitude: null,
      },
      setupComplete: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    calendar: {},
    plants: {}
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
    'profile.avatar': avatarId,
    'profile.location': location,
    'profile.firstName': firstName,
    'profile.lastName': lastName,
    'profile.setupComplete': true,
    'profile.updatedAt': serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    return null;
  }
  
  const userData = userDoc.data() as FirestoreUserData;
  return userData.profile;
}

export async function updateUserProfile(
  userId: string, 
  data: Partial<{
    firstName: string;
    lastName: string;
    avatar: number;
    location: UserLocation;
  }>
) {
  const userRef = doc(db, 'users', userId);
  const updates: Record<string, any> = {};

  // Map the updates to the nested profile structure
  Object.entries(data).forEach(([key, value]) => {
    updates[`profile.${key}`] = value;
  });
  
  updates['profile.updatedAt'] = serverTimestamp();

  await updateDoc(userRef, updates);
} 