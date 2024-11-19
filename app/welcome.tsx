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

// Generate array of profile image sources
const profileImages = Array.from({ length: 13 }, (_, i) => ({
  id: i + 1,
  source: require(`@/assets/images/profile-images/profile-${i + 1}.png`)
}));

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
        await updateDoc(doc(db, 'users', user.uid), {
          avatarId: selectedAvatar,
          location: {
            country: country.trim(),
            city: city.trim(),
          },
          setupComplete: true,
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
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  avatarContainer: {
    width: '30%',
    aspectRatio: 1,
    marginBottom: 16,
    borderRadius: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedAvatar: {
    borderColor: '#d6844b',
    backgroundColor: '#fff5ec',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
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