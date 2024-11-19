export interface Plant {
  id: string;
  name: string;
  displayName: string;
  normalizedName: string;
  imageUrl: string;
  sunPreferences: string;
  wateringNeeds: string;
  careDescription: string;
  createdAt: number;
  updatedAt: number;
  createdBy?: string;
  
  // User-specific fields
  addedToUserCollectionAt?: number;
  lastWateredAt?: number | null;
  notes?: string;
  customCareInstructions?: string;
} 