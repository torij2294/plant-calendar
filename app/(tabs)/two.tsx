import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SectionList, Alert, SectionListRenderItem } from 'react-native';
import { Text } from '@/components/Themed';
import { PlantTile } from '@/components/plants/PlantTile';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useRouter } from 'expo-router';
import { PlantData } from '@/types/plants';
import { eventEmitter } from '@/services/eventEmitter';

export default function TabTwoScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [sections, setSections] = useState([
    { title: 'To Plant', data: [] },
    { title: 'Planted', data: [] }
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserPlants();
    
    // Add listener for new plants
    const unsubscribe = eventEmitter.on('plantAdded', fetchUserPlants);

    return () => {
      eventEmitter.off('plantAdded', unsubscribe);
    };
  }, [user?.uid]);

  const fetchUserPlants = async () => {
    if (!user?.uid) return;

    try {
      const userPlantsRef = collection(db, 'userProfiles', user.uid, 'calendar');
      const q = query(userPlantsRef);
      const querySnapshot = await getDocs(q);
      
      const now = new Date();
      const currentPlants = [];
      const archivedPlants = [];

      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        const plantDate = new Date(data.date + 'T00:00:00.000Z');
        const plantItem = {
          id: doc.id,
          ...data,
          plantingDate: data.date
        };

        if (plantDate < now) {
          archivedPlants.push(plantItem);
        } else {
          currentPlants.push(plantItem);
        }
      });

      // Sort by planting date
      const sortByDate = (a, b) => 
        new Date(a.plantingDate + 'T00:00:00.000Z').getTime() - 
        new Date(b.plantingDate + 'T00:00:00.000Z').getTime();
      
      currentPlants.sort(sortByDate);
      archivedPlants.sort(sortByDate);

      setSections([
        { title: 'Plants to Plant', data: currentPlants },
        { title: 'Archive', data: archivedPlants }
      ]);
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  const renderPlantTile: SectionListRenderItem<PlantData> = ({ item }) => (
    <PlantTile
      key={`plant-${item.id}-${Date.now()}`}
      plant={item.plant}
      onPress={() => router.push(`/plant/${item.id}`)}
      plantingDate={item.plantingDate}
    />
  );

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        renderItem={renderPlantTile}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
        removeClippedSubviews={false}
        initialNumToRender={20}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5eef0',
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    backgroundColor: '#f5eef0',
    paddingVertical: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
    color: '#694449',
  },
  deleteContainer: {
    backgroundColor: '#f5eef0',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  deleteText: {
    color: '#fff',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 14,
  }
});
