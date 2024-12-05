import { useQuery } from '@tanstack/react-query';
import { getCurrentLocation } from '@/services/location';

export function useLocation() {
  return useQuery({
    queryKey: ['userLocation'],
    queryFn: async () => {
      const locationData = await getCurrentLocation();
      if (!locationData) {
        throw new Error('Location services are not enabled');
      }
      return locationData;
    },
    retry: 2, // Will try 2 times before showing error
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
} 