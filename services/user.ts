import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface UserLocation {
  country: string;
  city: string;
  coords?: {
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

export const updateUserWelcomeInfo = async (
  uid: string,
  avatar: number,
  location: Location
) => {
  try {
    console.log('Updating user welcome info:', { uid, avatar, location });
    
    const userRef = doc(db, 'users', uid);
    
    // Only update the specific fields we want to change
    const updateData = {
      avatar: avatar,
      location: location,
      setupComplete: true,
      updatedAt: serverTimestamp()
    };

    console.log('Update data:', updateData);
    
    await updateDoc(userRef, updateData);
    
    console.log('Update successful');
    return true;
  } catch (error) {
    console.error('Error updating user welcome info:', error);
    throw error;
  }
};

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