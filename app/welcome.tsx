import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { updateUserWelcomeInfo } from '@/services/user';

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
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [step, setStep] = useState(1); // 1 for avatar, 2 for location

  const handleComplete = async () => {
    if (!country.trim() || !city.trim()) {
      Alert.alert('Error', 'Please fill in both country and city');
      return;
    }

    try {
      if (user) {
        await updateUserWelcomeInfo(user.uid, selectedAvatar, {
          country: country.trim(),
          city: city.trim(),
        });
        router.replace('/(tabs)');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save your preferences');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {step === 1 ? (
        // Avatar Selection Step
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Choose Your Avatar</Text>
          <Text style={styles.subtitle}>Pick an avatar that represents you</Text>
          
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

          <TouchableOpacity 
            style={styles.nextButton}
            onPress={() => setStep(2)}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Location Selection Step
        <View style={styles.stepContainer}>
          <Text style={styles.title}>Where Are You Located?</Text>
          <Text style={styles.subtitle}>This helps us suggest plants suitable for your climate</Text>

          <View style={styles.formSection}>
            <TextInput
              style={styles.input}
              placeholder="Country"
              value={country}
              onChangeText={setCountry}
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.input}
              placeholder="City"
              value={city}
              onChangeText={setCity}
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.backButton]}
              onPress={() => setStep(1)}
            >
              <Text style={[styles.buttonText, styles.backButtonText]}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.completeButton]}
              onPress={handleComplete}
            >
              <Text style={styles.buttonText}>Complete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  stepContainer: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'PoppinsSemiBold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
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
    borderColor: '#d6844b',
    backgroundColor: '#fff5ec',
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
    flex: 0.48,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#d6844b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  backButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d6844b',
  },
  completeButton: {
    backgroundColor: '#d6844b',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
  },
  backButtonText: {
    color: '#d6844b',
  },
}); 