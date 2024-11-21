export interface Plant {
  id: string;
  
  // AI-generated fields from profile
  displayName: string;     // The common name returned by AI
  sunPreference: string;
  wateringPreference: string;
  generalInformation: string;
  
  // UI and search fields
  imageUrl: string;
  imageData?: string;
  normalizedName: string;  // Normalized version of displayName for search
  userQuery: string;       // The original name entered by the user
  
  // Metadata and user-specific fields
  createdBy: string;
  createdAt: number;
  updatedAt: number;
  lastWateredAt?: number | null;
  notes?: string;
  customCareInstructions?: string;
  imageId?: string;  // Firestore document ID for the image
} 