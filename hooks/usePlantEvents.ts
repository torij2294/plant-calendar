import { useQuery } from '@tanstack/react-query';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { parseISO } from 'date-fns';

export function usePlantEvents(userId: string | undefined, currentMonth: string) {
  return useQuery({
    queryKey: ['plantEvents', userId, currentMonth],
    queryFn: async () => {
      if (!userId) return [];

      const date = parseISO(currentMonth);
      const currentMonthNum = date.getMonth();
      const currentYear = date.getFullYear();

      const userPlantsRef = collection(db, 'userProfiles', userId, 'calendar');
      const q = query(userPlantsRef);
      const querySnapshot = await getDocs(q);
      
      const events = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          const eventDate = parseISO(data.date);

          if (eventDate.getMonth() === currentMonthNum && 
              eventDate.getFullYear() === currentYear) {
            return {
              id: doc.id,
              date: data.date,
              plant: data.plant
            };
          }
          return null;
        })
        .filter(event => event !== null)
        .sort((a, b) => {
          const dateA = parseISO(a.date);
          const dateB = parseISO(b.date);
          return dateA.getTime() - dateB.getTime();
        });

      return events;
    },
    enabled: !!userId && !!currentMonth,
    staleTime: 0,
    cacheTime: 1000 * 60 * 30,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });
} 