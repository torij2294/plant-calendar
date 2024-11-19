import { db } from '@/config/firebase';
import { Plant } from '@/types/plants';
import { 
  doc, 
  setDoc, 
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  DocumentReference,
  orderBy
} from 'firebase/firestore';

const PLANTS_COLLECTION = 'plants';
const USERS_COLLECTION = 'users';

interface CreatePlantData {
  name: string;
  imageUrl: string;
  sunPreferences: string;
  wateringNeeds: string;
  careDescription: string;
}

export async function createPlant(
  plantData: CreatePlantData, 
  userId: string
): Promise<{ globalPlant: Plant; userPlant: Plant }> {
  // Create a sanitized version of the plant name for the document ID
  const plantId = plantData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  
  // Create the base plant data
  const timestamp = serverTimestamp();
  const basePlantData = {
    ...plantData,
    normalizedName: plantData.name.toLowerCase(),
    displayName: plantData.name,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  // Create references
  const globalPlantRef = doc(db, PLANTS_COLLECTION, plantId);
  const userPlantRef = doc(
    db, 
    USERS_COLLECTION, 
    userId, 
    'plants', 
    plantId
  );

  try {
    // Global plant data includes creator information
    const globalPlantData = {
      ...basePlantData,
      createdBy: userId,
    };

    // User plant data includes additional user-specific fields
    const userPlantData = {
      ...basePlantData,
      addedToUserCollectionAt: timestamp,
      lastWateredAt: null,
      notes: '',
      customCareInstructions: '',
    };

    // Write both documents in parallel
    await Promise.all([
      setDoc(globalPlantRef, globalPlantData),
      setDoc(userPlantRef, userPlantData),
    ]);

    return {
      globalPlant: { id: plantId, ...globalPlantData } as Plant,
      userPlant: { id: plantId, ...userPlantData } as Plant,
    };
  } catch (error) {
    console.error('Error creating plant:', error);
    throw new Error('Failed to create plant');
  }
}

export async function searchPlants(searchTerm: string): Promise<Plant[]> {
  const normalizedTerm = searchTerm.toLowerCase().trim();
  
  if (!normalizedTerm) {
    return [];
  }

  const plantsRef = collection(db, PLANTS_COLLECTION);
  const q = query(
    plantsRef,
    where('normalizedName', '>=', normalizedTerm),
    where('normalizedName', '<=', normalizedTerm + '\uf8ff'),
    orderBy('normalizedName')
  );

  try {
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Plant));
  } catch (error) {
    console.error('Error searching plants:', error);
    throw new Error('Failed to search plants');
  }
}

export async function getUserPlants(userId: string): Promise<Plant[]> {
  const userPlantsRef = collection(db, USERS_COLLECTION, userId, 'plants');
  
  try {
    const snapshot = await getDocs(userPlantsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Plant));
  } catch (error) {
    console.error('Error fetching user plants:', error);
    throw new Error('Failed to fetch user plants');
  }
}

export async function generatePlantProfile(name: string): Promise<Omit<Plant, 'id' | 'createdAt'>> {
  // This would be replaced with actual OpenAI API call
  return {
    name,
    imageUrl: 'https://placeholder.com/plant-image.jpg',
    sunPreferences: 'Bright indirect light',
    wateringNeeds: 'Water when top inch of soil is dry',
    careDescription: `${name} is a beautiful plant that thrives in indoor environments...`,
  };
} 