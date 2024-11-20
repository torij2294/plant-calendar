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
} from 'react-native';
import { createNewPlant, searchExistingPlants } from '@/services/plantService';
import { Plant } from '@/types/plants';
import debounce from 'lodash/debounce';
import { useAuth } from '@/contexts/AuthContext'; 
import { PlantTile } from '@/components/plants/PlantTile';

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
    if (!searchTerm.trim() || !user) return;
    
    setStatus('checking');
    setError(null);
    
    try {
      setStatus('generating');
      const newPlant = await createNewPlant(searchTerm.trim(), user.uid);
      
      setStatus('saving');
      onClose();
    } catch (error: any) {
      setError(error.message);
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

  const handleClose = () => {
    // Run close animations first, then call onClose
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
    ]).start(() => {
      onClose();
    });
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

            {status !== 'idle' && (
              <View style={styles.statusContainer}>
                <ActivityIndicator color="#d6844b" />
                <Text style={styles.statusText}>
                  {status === 'checking' && 'Verifying plant name...'}
                  {status === 'generating' && 'Generating plant profile...'}
                  {status === 'saving' && 'Saving plant...'}
                </Text>
              </View>
            )}

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
                      onPress={(selectedPlant) => {
                        // Handle selecting existing plant
                        console.log('Selected plant:', selectedPlant.displayName);
                      }}
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
    backgroundColor: 'white',
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
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    margin: 24,
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
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#d6844b',
  },
  addNewText: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#d6844b',
    textAlign: 'center',
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeButton: {
    backgroundColor: '#d6844b',
    borderRadius: 12,
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
    color: '#666',
  },
  resultsContainer: {
    paddingTop: 8,
  },
}); 