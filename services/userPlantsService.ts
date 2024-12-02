import { db, functions, storage } from '@/config/firebase';
import { Plant } from '@/types/plants';
import { httpsCallable } from 'firebase/functions';
import { doc, setDoc, collection } from 'firebase/firestore';
import { getDownloadURL, ref } from 'firebase/storage';
import { eventEmitter } from '@/services/eventEmitter';

const getPlantingDateFunction = httpsCallable(functions, 'getPlantingDate');

export async function handlePlantSelection(
  plant: Plant, 
  userId: string, 
  userLocation: LocationData
) {
  try {
    console.log('Starting plant selection process...', {plant, userId, userLocation});

    // Get planting date
    const dateResponse = await getPlantingDateFunction({
      plantProfile: {
        name: plant.displayName,
        sunPreference: plant.sunPreference,
        wateringPreference: plant.wateringPreference
      },
      location: userLocation
    });

    console.log('Received planting date:', dateResponse.data.plantingDate);

    // Add to user's plants
    const userPlantRef = doc(db, 'userProfiles', userId, 'plants', plant.id);
    await setDoc(userPlantRef, {
      plantId: plant.id,
      plantingDate: dateResponse.data.plantingDate,
      addedToCalendar: true,
      addedAt: Date.now()
    });

    console.log('Added to user plants collection');

    // Add to calendar
    const calendarRef = doc(db, 'userProfiles', userId, 'calendar', plant.id);
    await setDoc(calendarRef, {
      date: dateResponse.data.plantingDate,
      title: `Plant ${plant.displayName}`,
      description: `Time to plant your ${plant.displayName}!`,
      plantId: plant.id,
      plant: {
        id: plant.id,
        displayName: plant.displayName,
        imageUrl: plant.imageUrl,
        sunPreference: plant.sunPreference,
        wateringPreference: plant.wateringPreference
      },
      createdAt: Date.now()
    });

    console.log('Added to calendar collection');

    eventEmitter.emit('plantAdded');

    return {
      success: true,
      plantingDate: dateResponse.data.plantingDate
    };
  } catch (error) {
    console.error('Error in handlePlantSelection:', error);
    throw error;
  }
} 