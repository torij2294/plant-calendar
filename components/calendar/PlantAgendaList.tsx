import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { PlantTile } from '@/components/plants/PlantTile';
import { Plant } from '@/types/plants';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

type PlantEvent = {
  id: string;
  plantId: string;
  plant: Plant;
  date: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export function PlantAgendaList({ selectedDate }: { selectedDate: string }) {
  const [events, setEvents] = useState<PlantEvent[]>([]);
  const { user } = useAuth();

  // Fetch events for the selected date
  useEffect(() => {
    async function fetchEvents() {
      try {
        const calendarRef = collection(db, 'userProfiles', user.uid, 'calendar');
        const q = query(calendarRef, where('date', '==', selectedDate));
        const querySnapshot = await getDocs(q);
        
        const fetchedEvents: PlantEvent[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          console.log('Calendar Event Data:', {
            id: doc.id,
            plantName: data?.plant?.displayName,
            imageUrl: data?.plant?.imageUrl,
            fullUrl: encodeURI(data?.plant?.imageUrl)
          });
          
          fetchedEvents.push({
            id: doc.id,
            plantId: data.plantId,
            plant: data.plant,
            date: data.date
          });
        });
        
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    }

    if (selectedDate && user) {
      fetchEvents();
    }
  }, [selectedDate, user]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Planting Schedule</Text>
      <FlatList<PlantEvent>
        style={styles.list}
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          console.log('Rendering PlantTile:', {
            plantName: item.plant.displayName,
            imageUrl: item.plant.imageUrl
          });
          return (
            <PlantTile 
              plant={item.plant}
              onPress={() => {}}
              plantingDate={formatDate(item.date)}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 20,
    fontFamily: 'PoppinsSemiBold',
    marginVertical: 16,
  },
  list: {
    flex: 1,
  }
}); 