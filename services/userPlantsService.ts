import { db, functions, storage } from '@/config/firebase';
import { Plant } from '@/types/plants';
import { httpsCallable } from 'firebase/functions';
import { doc, setDoc, collection } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';

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

    // Get the download URL for the image
    let imageUrl = plant.imageUrl;
    if (imageUrl && imageUrl.includes('firebase')) {
      // Get a fresh download URL if it's a Firebase Storage URL
      const imageRef = ref(storage, imageUrl);
      imageUrl = await getDownloadURL(imageRef);
    }

    // 2. Add plant to user's collection with planting date
    const userPlantRef = doc(db, 'userProfiles', userId, 'plants', plant.id);
    await setDoc(userPlantRef, {
      plantId: plant.id,
      plantingDate,
      addedToCalendar: true,
      addedAt: Date.now()
    });

    // 3. Add event to user's calendar
    const calendarRef = doc(db, 'userProfiles', userId, 'calendar', plant.id);
    await setDoc(calendarRef, {
      date: plantingDate,
      title: `Plant ${plant.displayName}`,
      description: `Time to plant your ${plant.displayName}!`,
      plantId: plant.id,
      plant: {
        id: plant.id,
        displayName: plant.displayName,
        imageUrl: imageUrl,
        sunPreference: plant.sunPreference,
        wateringPreference: plant.wateringPreference
      },
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