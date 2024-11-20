import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Plant } from '@/types/plants';
import defaultPlantImage from '@/assets/images/plant-calendar-logo.png';
import { handlePlantSelection } from '@/services/userPlantsService';
import { useAuth } from '@/context/AuthContext';
import { getCurrentLocation } from '@/services/location';

interface PlantTileProps {
  plant: Plant;
  onPress: (plant: Plant) => void;
}

export function PlantTile({ plant, onPress }: PlantTileProps) {
  const { user, userData } = useAuth();
  
  const handlePress = async () => {
    try {
      const location = await getCurrentLocation();
      const userLocation = location || {
        latitude: null,
        longitude: null,
        city: userData.city,
        country: userData.country
      };

      const result = await handlePlantSelection(plant, user.uid, userLocation);
      
      Alert.alert(
        "Plant Added!",
        `Best time to plant: ${result.plantingDate}`
      );
      
      onPress(plant);
    } catch (error) {
      Alert.alert("Error", "Failed to add plant to your calendar");
      console.error(error);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={handlePress}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={plant.imageUrl ? { uri: plant.imageUrl } : defaultPlantImage}
          style={styles.image}
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
    width: 60,
    height: 60,
    borderRadius: 30,
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
}); 