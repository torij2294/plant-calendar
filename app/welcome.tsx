import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserWelcomeInfo } from '@/services/user';
import * as Location from 'expo-location';
import { getCurrentLocation, validateLocation } from '@/services/location';

// Create a static mapping of profile images
const profileImages = [
  { id: 1, source: require('@/assets/images/profile-images/profile-1.png') },
  { id: 2, source: require('@/assets/images/profile-images/profile-2.png') },
  { id: 3, source: require('@/assets/images/profile-images/profile-3.png') },
  { id: 4, source: require('@/assets/images/profile-images/profile-4.png') },
  { id: 5, source: require('@/assets/images/profile-images/profile-5.png') },
  { id: 6, source: require('@/assets/images/profile-images/profile-6.png') },
  { id: 7, source: require('@/assets/images/profile-images/profile-7.png') },
  { id: 8, source: require('@/assets/images/profile-images/profile-8.png') },
  { id: 9, source: require('@/assets/images/profile-images/profile-9.png') },
  { id: 11, source: require('@/assets/images/profile-images/profile-11.png') },
  { id: 12, source: require('@/assets/images/profile-images/profile-12.png') },
  { id: 13, source: require('@/assets/images/profile-images/profile-13.png') },
];

export default function WelcomeScreen() {
  const { user } = useAuth();
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [location, setLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = async () => {
    setIsGettingLocation(true);
    try {
      const locationData = await getCurrentLocation();
      if (locationData) {
        setLocation(locationData);
      } else {
        Alert.alert(
          'Location Required', 
          'Please enable location services to continue'
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to get location');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleComplete = async () => {
    if (!location) {
      Alert.alert('Error', 'Location is required to continue');
      return;
    }

    try {
      if (user) {
        console.log('Attempting to update welcome info with:', {
          uid: user.uid,
          avatar: selectedAvatar,
          location
        });
        
        await updateUserWelcomeInfo(
          user.uid, 
          selectedAvatar,
          location
        );
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error in handleComplete:', error);
      Alert.alert('Error', 'Failed to save your preferences: ' + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stepContainer}>
        <Text style={styles.title}>Choose Your Avatar</Text>
        
        <ScrollView 
          contentContainerStyle={styles.avatarGrid}
          showsVerticalScrollIndicator={false}
        >
          {profileImages.map((image) => (
            <TouchableOpacity
              key={image.id}
              style={[
                styles.avatarContainer,
                selectedAvatar === image.id && styles.selectedAvatar
              ]}
              onPress={() => setSelectedAvatar(image.id)}
            >
              <Image 
                source={image.source}
                style={styles.avatar}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.locationSection}>
          {location ? (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                Location: {location.city}, {location.country}
              </Text>
              <TouchableOpacity 
                style={styles.updateLocationButton}
                onPress={getLocation}
              >
                <Text style={styles.updateLocationText}>Update Location</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.locationButton}
              onPress={getLocation}
              disabled={isGettingLocation}
            >
              {isGettingLocation ? (
                <ActivityIndicator color="#5a6736" />
              ) : (
                <Text style={styles.locationButtonText}>
                  Get Current Location
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.button, styles.completeButton]}
            onPress={handleComplete}
          >
            <Text style={styles.buttonText}>Complete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5eef0',
  },
  stepContainer: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsSemiBold',
    color: '#694449',
    textAlign: 'center',
    marginBottom: 8,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    paddingVertical: 16,
  },
  avatarContainer: {
    width: '30%',
    aspectRatio: 1,
    marginBottom: 20,
    borderRadius: 100,
    padding: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  selectedAvatar: {
    borderColor: '#ddc6c9',
    backgroundColor: '#f2eee4',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  formSection: {
    marginTop: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Poppins',
    backgroundColor: '#F8F8F8',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#ddc6c9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#694449',
  },
  completeButton: {
    backgroundColor: '#694449',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
  },
  backButtonText: {
    color: '#694449',
  },
  locationButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  locationButtonText: {
    color: '#694449',
    fontFamily: 'PoppinsSemiBold',
  },
  inputError: {
    borderColor: '#ff6b6b',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontFamily: 'Poppins',
    marginTop: 4,
  },
  locationSection: {
    marginTop: 16,
  },
  locationInfo: {
    marginTop: 8,
  },
  locationText: {
    color: '#694449',
    fontFamily: 'PoppinsSemiBold',
  },
  updateLocationButton: {
    backgroundColor: '#ddc6c9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  updateLocationText: {
    color: '#694449',
    fontFamily: 'PoppinsSemiBold',
  },
}); 