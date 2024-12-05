import { useQuery, useQueryClient } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

// Hook for individual plant
export function usePlant(plantId: string, userId?: string) {
  return useQuery({
    queryKey: ['plant', plantId, userId],
    queryFn: async () => {
      if (!userId) return null;

      // Get the calendar entry first
      const calendarDocRef = doc(db, 'users', userId, 'calendar', plantId);
      const calendarDoc = await getDoc(calendarDocRef);
      
      // Get the base plant data for additional fields
      const plantDocRef = doc(db, 'plants', plantId);
      const plantDoc = await getDoc(plantDocRef);
      
      if (!calendarDoc.exists() || !plantDoc.exists()) {
        throw new Error('Plant not found');
      }

      const calendarData = calendarDoc.data();
      const plantData = plantDoc.data();

      // Merge the data, prioritizing calendar data for overlapping fields
      return {
        ...plantData,
        ...calendarData.plant,
        plantingDate: calendarData.date,
      };
    },
    enabled: !!plantId && !!userId,
  });
}

// Hook for prefetching plant data
export function usePrefetchPlant() {
  const queryClient = useQueryClient();

  const prefetchPlant = async (plantId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['plant', plantId],
      queryFn: async () => {
        const docRef = doc(db, 'plants', plantId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          throw new Error('Plant not found');
        }
        return docSnap.data();
      },
      staleTime: 1000 * 60 * 5,
    });
  };

  return prefetchPlant;
} 