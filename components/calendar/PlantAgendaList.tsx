import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, FlatList, Image } from 'react-native';
import { PlantTile } from '@/components/plants/PlantTile';
import { Plant } from '@/types/plants';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { parseISO } from 'date-fns';

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
    console.log('PlantAgendaList received new month:', currentMonth);
    
    const fetchMonthEvents = async () => {
      if (!user?.uid) return;

      try {
        const date = parseISO(currentMonth);
        const currentMonthNum = date.getMonth();
        const currentYear = date.getFullYear();

        console.log('Processing month:', {
          rawDate: date,
          month: currentMonthNum + 1,
          year: currentYear
        });

        console.log('1. Fetching events for month:', currentMonth);
        const userPlantsRef = collection(db, 'userProfiles', user.uid, 'calendar');
        const q = query(userPlantsRef);
        const querySnapshot = await getDocs(q);
        
        // Log raw data
        console.log('2. Raw calendar data:', querySnapshot.docs.map(doc => ({
          id: doc.id,
          data: doc.data()
        })));

        const events = querySnapshot.docs
          .map(doc => {
            const data = doc.data();
            const eventDate = parseISO(data.date);
            console.log('4. Processing event:', {
              date: data.date,
              eventDate,
              month: eventDate.getMonth(),
              year: eventDate.getFullYear()
            });

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
          .sort((a, b) => {
            const dateA = parseISO(a.date);
            const dateB = parseISO(b.date);
            return dateA.getTime() - dateB.getTime();
          });

        console.log('5. Filtered events:', events);
        setMonthEvents(events);
      } catch (error) {
        console.error('Error fetching month events:', error);
      }
    };

    fetchMonthEvents();
  }, [currentMonth, user?.uid]);

  // Add this to verify month name calculation
  const monthName = useMemo(() => {
    const date = new Date(currentMonth);
    const name = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    console.log('Calculated month name:', name);
    return name;
  }, [currentMonth]);

  if (!monthEvents || monthEvents.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.noEventsText}>
          No plants to plant this month
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
                  Plant on: {new Date(item.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
                <View style={styles.detailsContainer}>
                  <Text style={styles.detailText}>{item.plant.sunPreference}</Text>
                  <Text style={styles.bulletPoint}> • </Text>
                  <Text style={styles.detailText}>{item.plant.wateringPreference}</Text>
                </View>
              </View>
            </View>
          )}
          style={styles.list}
          contentContainerStyle={{ 
            paddingBottom: 100,  // Add more padding for tab bar
          }}
          showsVerticalScrollIndicator={true}
          scrollEnabled={true}
          nestedScrollEnabled={true}  // Add this
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
    backgroundColor: '#f5eef0',
    padding: 16,
  },
  list: {
    flex: 1,
  },
  eventItem: {
    flexDirection: 'row',
    padding: 6,
    marginBottom: 8,
    backgroundColor: '#f5eef0',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#694449',
    alignItems: 'center',
  },
  selectedEvent: {
    backgroundColor: '#f4dbde',
    borderColor: '#ddc6c9',
    borderWidth: 1,
  },
  plantImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  eventContent: {
    marginLeft: 12,
    flex: 1,
  },
  plantName: {
    fontSize: 20,
    fontFamily: 'PoppinsSemiBold',
    color: '#694449',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#ed9aa4',
    marginBottom: 2
  },
  noEventsText: {
    textAlign: 'center',
    color: '#666666',
    fontFamily: 'Poppins',
    fontSize: 16,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666666',
  },
  bulletPoint: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666666',
    marginHorizontal: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 