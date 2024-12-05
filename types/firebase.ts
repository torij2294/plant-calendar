export interface UserLocation {
  city: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar: number;
  location: UserLocation;
  setupComplete: boolean;
  createdAt: any; // FirebaseFirestore.Timestamp
  updatedAt: any; // FirebaseFirestore.Timestamp
}

export interface FirestoreUserData {
  profile: UserProfile;
  calendar: Record<string, any>;
  plants: Record<string, any>;
} 