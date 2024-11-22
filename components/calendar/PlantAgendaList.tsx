import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image } from 'react-native';
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

interface PlantAgendaListProps {
  selectedDate: string;
  currentMonth: string;
}

export function PlantAgendaList({ selectedDate, currentMonth }: PlantAgendaListProps) {
  const [monthEvents, setMonthEvents] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMonthEvents = async () => {
      if (!user?.uid) return;

      try {
        console.log('Current Month:', currentMonth);
        const userPlantsRef = collection(db, 'userProfiles', user.uid, 'calendar');
        const q = query(userPlantsRef);
        const querySnapshot = await getDocs(q);
        
        // Get month and year from currentMonth
        const currentDate = new Date(currentMonth);
        const currentMonthNum = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const events = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            const eventDate = new Date(data.date);
            
            // Only include events from current month and year
            if (eventDate.getMonth() === currentMonthNum && 
                eventDate.getFullYear() === currentYear) {
              return {
                id: doc.id,
                date: data.date,
                plant: data.plant
              };
            }
            return null;
          })
          .filter(event => event !== null)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        console.log('Filtered events:', events);
        setMonthEvents(events);
      } catch (error) {
        console.error('Error fetching month events:', error);
      }
    };

    fetchMonthEvents();
  }, [currentMonth, user?.uid]);

  // Get month name for header
  const monthName = new Date(currentMonth).toLocaleString('default', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <View style={styles.container}>
      <Text style={styles.monthHeader}>{monthName}</Text>
      {monthEvents.length > 0 ? (
        <FlatList
          data={monthEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[
              styles.eventItem,
              new Date(item.date).toISOString().split('T')[0] === selectedDate && styles.selectedEvent
            ]}>
              <Image
                source={{ uri: item.plant.imageUrl }}
                style={styles.plantImage}
                defaultSource={require('@/assets/images/plant-calendar-logo.png')}
              />
              <View style={styles.eventContent}>
                <Text style={styles.plantName}>{item.plant.displayName}</Text>
                <Text style={styles.dateText}>
                  {new Date(item.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>
          )}
          style={styles.list}
        />
      ) : (
        <Text style={styles.noEventsText}>No plants to plant this month</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  monthHeader: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
    color: '#5a6736',
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  eventItem: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
  },
  selectedEvent: {
    backgroundColor: '#faf0e6',
    borderColor: '#d6844b',
    borderWidth: 1,
  },
  plantImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  eventContent: {
    marginLeft: 12,
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontFamily: 'PoppinsSemiBold',
    color: '#2c2c2c',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666666',
  },
  noEventsText: {
    textAlign: 'center',
    color: '#666666',
    fontFamily: 'Poppins',
    marginTop: 20,
  },
}); 