import React, { useEffect, useRef, useState } from 'react';
import { 
  Modal, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  Animated,
  TextInput,
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Keyboard,
} from 'react-native';
import { createNewPlant, searchExistingPlants } from '@/services/plantService';
import { Plant } from '@/types/plants';
import debounce from 'lodash/debounce';
import { useAuth } from '@/contexts/AuthContext'; 
import { PlantTile } from '@/components/plants/PlantTile';
import { getCurrentLocation, type LocationData } from '@/services/location';
import { handlePlantSelection } from '@/services/userPlantsService';
import { Video } from 'expo-av';
import { Asset } from 'expo-asset';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import LottieView from 'lottie-react-native';

interface AddModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export function AddModal({ isVisible, onClose }: AddModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Plant[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(600)).current;
  const [status, setStatus] = useState<'idle' | 'checking' | 'generating' | 'saving'>('idle');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [isVideoReady, setIsVideoReady] = useState(false);
  const videoRef = useRef<Video>(null);

  // Debounced search function
  const debouncedSearch = debounce(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const existingPlants = await searchExistingPlants(term);
      setSearchResults(existingPlants);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, 500);

  // Handle search input changes
  const handleSearch = (text: string) => {
    setSearchTerm(text);
    setError(null);
    debouncedSearch(text);
  };

  // Handle adding a new plant
  const handleAddPlant = async () => {
    if (!searchTerm.trim()) return;
    
    // Dismiss keyboard
    Keyboard.dismiss();
    
    try {
      if (!user?.uid) {
        throw new Error('User not logged in');
      }
      
      setStatus('checking');
      const normalizedSearchTerm = searchTerm.trim().toLowerCase();
      console.log('Checking plant name:', normalizedSearchTerm);
      
      setStatus('generating');
      console.log('Starting plant generation for:', normalizedSearchTerm, 'userId:', user.uid);
      
      const newPlant = await createNewPlant(normalizedSearchTerm, user.uid);
      console.log('Plant generated:', newPlant);
      
      setStatus('saving');
      const location = await getCurrentLocation();
      console.log('Got location:', location);
      
      if (!location) {
        throw new Error('Could not get location');
      }
      
      const result = await handlePlantSelection(newPlant, user.uid, location);
      console.log('Plant selection result:', result);
      
      if (result.success) {
        Alert.alert(
          'Success', 
          `${newPlant.displayName} has been added to your garden! Planting date: ${result.plantingDate}`,
          [{ text: 'OK', onPress: () => handleClose() }]
        );
      }
    } catch (error) {
      console.error('Error in handleAddPlant:', error);
      setError('Failed to add plant. Please try again.');
    } finally {
      setStatus('idle');
    }
  };

  useEffect(() => {
    if (isVisible) {
      // Open animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          mass: 1,
          stiffness: 100,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      // Close animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 600,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [isVisible]);

  useEffect(() => {
    if (status === 'generating') {
      // Start playing the video when generating starts
      videoRef.current?.playAsync();
    } else {
      // Pause the video when not generating
      videoRef.current?.pauseAsync();
    }
  }, [status]);

  const resetModalState = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsSearching(false);
    setStatus('idle');
    setError(null);
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  const LoadingOverlay = () => (
    <View style={styles.loadingOverlay}>
      <LottieView
        source={require('@/assets/animations/loading-animation.json')}
        style={styles.loadingAnimation}
        autoPlay
        loop
        speed={0.7}
        renderMode="HARDWARE"
      />
      <Text style={styles.statusText}>
        {status === 'checking' && 'Verifying plant name...'}
        {status === 'generating' && 'Generating plant profile. This may take a minute...'}
        {status === 'saving' && 'Saving plant...'}
      </Text>
    </View>
  );

  const handleExistingPlantSelection = async (selectedPlant: Plant) => {
    if (!user?.uid) {
      throw new Error('User not logged in');
    }
    
    try {
      setStatus('checking');
      
      // Check if plant already exists in user's calendar
      const calendarRef = collection(db, 'userProfiles', user.uid, 'calendar');
      const q = query(calendarRef, where('plantId', '==', selectedPlant.id));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        Alert.alert(
          'Already Added',
          'This plant is already in your garden!',
          [{ text: 'OK', onPress: () => onClose() }]
        );
        return;
      }
      
      setStatus('saving');
      const location = await getCurrentLocation();
      
      if (!location) {
        throw new Error('Could not get location');
      }
      
      const result = await handlePlantSelection(selectedPlant, user.uid, location);
      
      if (result.success) {
        Alert.alert(
          'Success', 
          `${selectedPlant.displayName} has been added to your garden! Planting date: ${result.plantingDate}`,
          [{ text: 'OK', onPress: () => onClose() }]
        );
      }
    } catch (error) {
      console.error('Error adding existing plant:', error);
      setError('Failed to add plant. Please try again.');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <Animated.View 
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.overlayTouch}
            onPress={handleClose}
            activeOpacity={1}
          />
        </Animated.View>

        <View style={styles.centeredView}>
          <Animated.View 
            style={[
              styles.modalView,
              {
                transform: [{
                  translateY: slideAnim
                }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalText}>Search Plants</Text>
            </View>
            
            <TextInput
              style={styles.searchInput}
              placeholder="Search for a plant..."
              value={searchTerm}
              onChangeText={handleSearch}
              returnKeyType="search"
            />

            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}

            {status !== 'idle' && <LoadingOverlay />}

            <ScrollView 
              style={styles.scrollView}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.scrollViewContent}
            >
              {isSearching && (
                <ActivityIndicator style={styles.loader} color="#d6844b" />
              )}

              {searchResults.length > 0 ? (
                <View style={styles.resultsContainer}>
                  {searchResults.map((plant) => (
                    <PlantTile
                      key={plant.id}
                      plant={plant}
                      onPress={() => handleExistingPlantSelection(plant)}
                    />
                  ))}
                </View>
              ) : (
                searchTerm.trim() && !isSearching && (
                  <TouchableOpacity 
                    style={styles.addNewButton}
                    onPress={handleAddPlant}
                  >
                    <Text style={styles.addNewText}>
                      Add "{searchTerm}" as new plant
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouch: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalView: {
    backgroundColor: '#f5eef0',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: '80%', // Fixed height
    maxHeight: '80%',
  },
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalText: {
    fontSize: 20,
    fontFamily: 'PoppinsSemiBold',
    color: '#694449',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddc6c9',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    marginHorizontal: 24,
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  loader: {
    marginVertical: 20,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultText: {
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  resultSubtext: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666',
  },
  addNewButton: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#694449',
  },
  addNewText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#694449',
    textAlign: 'center',
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeButton: {
    backgroundColor: '#694449',
    borderRadius: 999,
    padding: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    fontFamily: 'Poppins',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  statusText: {
    marginLeft: 12,
    fontFamily: 'Poppins',
    fontSize: 14,
    color: '#694449',
  },
  resultsContainer: {
    paddingTop: 8,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(245, 238, 240, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingAnimation: {
    width: 200,
    height: 200,
  },
  statusText: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    color: '694449',
    textAlign: 'center',
    marginTop: 16,
  },
}); 