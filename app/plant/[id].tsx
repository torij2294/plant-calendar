import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect, useState } from 'react';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export default function PlantProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [plantData, setPlantData] = useState(null);

  useEffect(() => {
    const fetchPlantData = async () => {
      if (!user?.uid || !id) return;
      
      try {
        // Get the calendar entry
        const calendarDoc = await getDoc(doc(db, 'userProfiles', user.uid, 'calendar', id as string));
        
        if (calendarDoc.exists()) {
          const calendarData = calendarDoc.data();
          
          // Get the complete plant data from the plants collection
          const plantDoc = await getDoc(doc(db, 'plants', calendarData.plant.id));
          
          if (plantDoc.exists()) {
            const fullPlantData = plantDoc.data();
            // Merge the data
            setPlantData({
              ...calendarData,
              plant: {
                ...calendarData.plant,
                generalInformation: fullPlantData.generalInformation
              }
            });
            console.log('Full plant data:', fullPlantData.generalInformation);
          }
        }
      } catch (error) {
        console.error('Error fetching plant data:', error);
      }
    };

    fetchPlantData();
  }, [id, user?.uid]);

  const handleDelete = async () => {
    if (!user?.uid || !id) return;

    Alert.alert(
      'Delete Plant',
      'Are you sure you want to delete this plant?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'userProfiles', user.uid, 'calendar', id as string));
              router.back();
            } catch (error) {
              console.error('Error deleting plant:', error);
              Alert.alert('Error', 'Failed to delete plant');
            }
          }
        }
      ]
    );
  };

  if (!plantData) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#5a6736" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Plant Profile */}
        <View style={styles.profileSection}>
          <View style={styles.plantImageContainer}>
            <Image 
              source={{ uri: plantData.plant.imageUrl }}
              style={styles.plantImage}
              defaultSource={require('@/assets/images/plant-calendar-logo.png')}
            />
          </View>
          <Text style={styles.plantName}>{plantData.plant.displayName}</Text>
          <Text style={styles.plantingDate}>
            Plant on: {new Date(plantData.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>

        {/* Care Requirements */}
        <View style={styles.careSection}>
          <View style={styles.careCard}>
            <Ionicons name="sunny" size={24} color="#d6844b" />
            <Text style={styles.careText}>{plantData.plant.sunPreference}</Text>
          </View>
          <View style={styles.careCard}>
            <Ionicons name="water" size={24} color="#4b8bd6" />
            <Text style={styles.careText}>{plantData.plant.wateringPreference}</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>
            {plantData.plant.generalInformation}
          </Text>
        </View>

        {/* Add delete button */}
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete Plant</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  plantImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
  },
  plantImage: {
    width: '100%',
    height: '100%',
  },
  plantName: {
    fontSize: 24,
    fontFamily: 'PoppinsSemiBold',
    color: '#5a6736',
    marginBottom: 8,
  },
  plantingDate: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#666666',
  },
  careSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  careCard: {
    flex: 1,
    marginHorizontal: 8,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
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
  careText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666666',
    textAlign: 'center',
  },
  descriptionSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666666',
    lineHeight: 22,
  },
  deleteButton: {
    backgroundColor: '#fff',
    marginTop: 32,
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff4444',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  deleteButtonText: {
    color: '#ff4444',
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
  },
}); 