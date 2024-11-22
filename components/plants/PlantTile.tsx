import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Plant } from '@/types/plants';
import { handlePlantSelection } from '@/services/userPlantsService';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';
import { getCurrentLocation, type LocationData } from '@/services/location';

const defaultPlantImage = require('@/assets/images/plant-calendar-logo.png');

interface PlantTileProps {
  plant: Plant;
  onPress: (plant: Plant) => void;
  plantingDate?: string;
}

export function PlantTile({ plant, onPress, plantingDate }: PlantTileProps) {
  const { user } = useAuth();
  const [imageSource, setImageSource] = useState<any>(defaultPlantImage);

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

  const handleAddPlant = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to add plants');
      return;
    }

    try {
      // Get user's location
      const location = await getCurrentLocation();
      if (!location) {
        Alert.alert('Error', 'Unable to get your location');
        return;
      }

      const result = await handlePlantSelection(plant, user.uid, location);
      
      if (result.success) {
        Alert.alert(
          'Success', 
          `${plant.displayName} has been added to your garden! Planting date: ${result.plantingDate}`
        );
      }
    } catch (error) {
      console.error('Error adding plant:', error);
      Alert.alert('Error', 'Failed to add plant to your garden');
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handleAddPlant}
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