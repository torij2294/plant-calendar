import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Plant } from '@/types/plants';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentLocation } from '@/services/location';
import { handlePlantSelection } from '@/services/userPlantsService';
import { storage } from '@/config/firebase';
import { getDownloadURL, ref } from 'firebase/storage';

const defaultPlantImage = require('@/assets/images/plant-calendar-logo.png');

interface PlantTileProps {
  plant: Plant;
  onPress: (plant: Plant) => void;
  plantingDate?: string;
}

export function PlantTile({ plant, onPress, plantingDate }: PlantTileProps) {
  const { user, userData } = useAuth();
  const [imageSource, setImageSource] = useState(defaultPlantImage);
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    if (plant.imageUrl && plant.imageUrl.startsWith('data:image')) {
      setImageSource({ uri: plant.imageUrl });
    }
  }, [plant.imageUrl]);

  console.log('Plant Tile Render:', {
    plantName: plant.displayName,
    imageUrl: plant.imageUrl,
    hasDefaultImage: !plant.imageUrl,
    isImageError: imageError
  });

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(plant)}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={imageSource}
          style={styles.image}
          onError={(error) => {
            console.error('Image loading error:', error.nativeEvent);
            setImageSource(defaultPlantImage);
          }}
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
            Plant on: {plantingDate}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
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
    borderRadius: 8,
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
    fontFamily: 'PoppinsSemiBold',
    color: '#2c2c2c',
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
    color: '#d6844b',
    marginTop: 4,
  },
}); 