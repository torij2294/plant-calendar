import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Plant } from '@/types/plants';
import { handlePlantSelection } from '@/services/userPlantsService';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';
import { getCurrentLocation, type LocationData } from '@/services/location';
import { useRouter } from 'expo-router';
import { parseISO, format } from 'date-fns';

const defaultPlantImage = require('@/assets/images/plant-calendar-logo.png');

interface PlantTileProps {
  plant: Plant;
  onPress: (plant: Plant) => void;
  plantingDate?: string;
  index?: number;
}

export function PlantTile({ plant, onPress, plantingDate }: PlantTileProps) {
  const { user } = useAuth();
  const [imageSource, setImageSource] = useState<any>(defaultPlantImage);
  const router = useRouter();

  useEffect(() => {
    if (plant.imageUrl) {
      const imageUri = plant.imageUrl.trim();
      console.log('Loading image from URL:', imageUri);
      
      setImageSource({
        uri: imageUri,
        cache: 'reload',
        headers: {
          Accept: 'image/png,image/jpeg,image/jpg',
        },
      });
    }
  }, [plant.imageUrl]);

  const handleImageError = () => {
    console.error('Failed to load image:', plant.imageUrl);
    setImageSource(defaultPlantImage);
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(plant)}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={imageSource}
          style={styles.image}
          onError={handleImageError}
          onLoad={() => console.log('Image loaded successfully:', plant.imageUrl)}
          loadingIndicatorSource={defaultPlantImage}
        />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.plantName} numberOfLines={1}>
          {plant.displayName}
        </Text>
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText} numberOfLines={1}>
            {plant.wateringPreference}
          </Text>
          <Text style={styles.bulletPoint}> • </Text>
          <Text style={styles.detailText} numberOfLines={1}>
            {plant.sunPreference}
          </Text>
        </View>
        {plantingDate && (
          <Text style={styles.dateText}>
            Plant on: {format(parseISO(plantingDate), 'MMMM d, yyyy')}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
//These styles are for the plant tile in the plant tab. The styles for the agenda list are in PlantAgendaList.tsx
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'f5eef0',
    borderRadius: 12,
    marginBottom: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ddc6c9',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  plantName: {
    fontSize: 16,
    fontFamily: 'PoppinsBold',
    color: '#694449',
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Poppins',
    color: '#666666',
  },
  bulletPoint: {
    fontSize: 12,
    color: '#666666',
    marginHorizontal: 4,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'PoppinsSemiBold',
    color: '#ed9aa4',
    marginTop: 0,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 