import { db, functions } from '@/config/firebase';
import { Plant } from '@/types/plants';
import { httpsCallable } from 'firebase/functions';
import { doc, setDoc, collection } from 'firebase/firestore';

const getPlantingDateFunction = httpsCallable(functions, 'getPlantingDate');

export async function handlePlantSelection(
  plant: Plant, 
  userId: string, 
  userLocation: { 
    latitude: number | null; 
    longitude: number | null; 
    city: string; 
    country: string 
  }
) {
  try {
    // 1. Get planting date from Firebase Function
    const dateResponse = await getPlantingDateFunction({
      plantProfile: {
        name: plant.displayName,
        sunPreference: plant.sunPreference,
        wateringPreference: plant.wateringPreference
      },
      location: userLocation
    });

    const plantingDate = dateResponse.data.plantingDate;

    // 2. Add plant to user's collection with planting date
    const userPlantRef = doc(collection(db, `userProfiles/${userId}/plants`), plant.id);
    await setDoc(userPlantRef, {
      plantId: plant.id,
      plantingDate,
      addedToCalendar: true,
      addedAt: Date.now()
    });

    // 3. Add event to user's calendar
    const calendarRef = doc(collection(db, `userProfiles/${userId}/calendar`), plant.id);
    await setDoc(calendarRef, {
      date: plantingDate,
      title: `Plant ${plant.displayName}`,
      description: `Time to plant your ${plant.displayName}!`,
      plantId: plant.id,
      createdAt: Date.now()
    });

    return {
      success: true,
      plantingDate
    };
  } catch (error) {
    console.error('Error in handlePlantSelection:', error);
    throw new Error('Failed to process plant selection');
  }
} 