import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export function useUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      console.log('Fetching user profile for:', userId);
      if (!userId) throw new Error('No user ID provided');
      
      const userDoc = await getDoc(doc(db, 'users', userId));
      const data = userDoc.data();
      
      if (!data) throw new Error('No user data found');
      
      console.log('Fetched user profile:', data);
      return {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        avatar: data.avatar || null,
        location: {
          latitude: data.location?.latitude || null,
          longitude: data.location?.longitude || null,
          city: data.location?.city || '',
          country: data.location?.country || '',
        }
      };
    },
    enabled: !!userId,
    onError: (error) => {
      console.error('Error fetching user profile:', error);
    },
    onSuccess: (data) => {
      console.log('Successfully fetched user profile:', data);
    },
  });
} 