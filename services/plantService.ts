import { db } from '@/config/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Plant } from '@/types/plants';
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const getPlantProfileFunction = httpsCallable(functions, 'getPlantProfile');

function normalizePlantName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const DEFAULT_PLANT_IMAGE = 'https://your-default-plant-image-url.com/default.jpg';

export async function createNewPlant(
  userQuery: string, 
  userId: string
): Promise<Plant> {
  try {
    const result = await getPlantProfileFunction({ plantName: userQuery });
    const response = result.data as {
      exists: boolean;
      plantProfile?: {
        name: string;
        sunPreference: string;
        wateringPreference: string;
        generalInformation: string;
      };
      imagePrompt?: string;
      imageUrl?: string;
    };

    if (!response.exists) {
      throw new Error('This does not appear to be a valid plant name');
    }

    if (!response.plantProfile) {
      throw new Error('Failed to generate plant information');
    }

    const timestamp = Date.now();
    const normalizedName = normalizePlantName(response.plantProfile.name);
    
    // Create new plant document
    const plantData: Omit<Plant, 'id'> = {
      displayName: response.plantProfile.name,
      sunPreference: response.plantProfile.sunPreference,
      wateringPreference: response.plantProfile.wateringPreference,
      generalInformation: response.plantProfile.generalInformation,
      imageUrl: response.imageUrl || DEFAULT_PLANT_IMAGE, // Use generated image if available
      normalizedName,
      userQuery,
      createdBy: userId,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastWateredAt: null,
      notes: '',
      customCareInstructions: '',
    };

    // Add to Firestore
    const plantsRef = collection(db, 'plants');
    const docRef = await addDoc(plantsRef, plantData);

    return {
      id: docRef.id,
      ...plantData,
    };
  } catch (error) {
    console.error('Error creating new plant:', error);
    throw error;
  }
}

// Function to search existing plants
export async function searchExistingPlants(searchTerm: string): Promise<Plant[]> {
  try {
    const plantsRef = collection(db, 'plants');
    const normalizedSearch = searchTerm.toLowerCase().trim();
    
    // Query plants where normalizedName contains the search term
    const q = query(
      plantsRef,
      where('normalizedName', '>=', normalizedSearch),
      where('normalizedName', '<=', normalizedSearch + '\uf8ff')
    );

    const querySnapshot = await getDocs(q);
    const plants: Plant[] = [];
    
    querySnapshot.forEach((doc) => {
      plants.push({ id: doc.id, ...doc.data() } as Plant);
    });

    return plants;
  } catch (error) {
    console.error('Error searching plants:', error);
    throw error;
  }
} 