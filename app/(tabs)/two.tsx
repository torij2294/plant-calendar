import React, { useState, useEffect } from 'react';
import { StyleSheet, View, SectionList, Alert } from 'react-native';
import { Text } from '@/components/Themed';
import { PlantTile } from '@/components/plants/PlantTile';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Swipeable } from 'react-native-gesture-handler';

export default function TabTwoScreen() {
  const { user } = useAuth();
  const [sections, setSections] = useState([
    { title: 'Plants to Plant', data: [] },
    { title: 'Archive', data: [] }
  ]);

  useEffect(() => {
    fetchUserPlants();
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
        const plantDate = new Date(data.date);
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
      const sortByDate = (a, b) => new Date(a.plantingDate) - new Date(b.plantingDate);
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

  const handleDelete = async (plantId: string) => {
    if (!user?.uid) return;

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
              await deleteDoc(doc(db, 'userProfiles', user.uid, 'calendar', plantId));
              fetchUserPlants();
            } catch (error) {
              console.error('Error deleting plant:', error);
              Alert.alert('Error', 'Failed to delete plant');
            }
          }
        }
      ]
    );
  };

  const renderPlantTile = ({ item, section }) => {
    const RightSwipeActions = () => {
      return (
        <View style={styles.deleteContainer}>
          <Text style={styles.deleteText}>Delete</Text>
        </View>
      );
    };

    return (
      <Swipeable
        renderRightActions={RightSwipeActions}
        onSwipeableRightOpen={() => handleDelete(item.id)}
      >
        <PlantTile
          plant={item.plant}
          onPress={() => {}}
          plantingDate={new Date(item.plantingDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        />
      </Swipeable>
    );
  };

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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContent: {
    padding: 16,
  },
  sectionHeader: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
    color: '#5a6736',
  },
  deleteContainer: {
    backgroundColor: '#ff4444',
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
