import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { PlantAgendaList } from './PlantAgendaList';
import { typography } from '@/theme/typography';
import { eventEmitter } from '@/services/eventEmitter';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';

export default function PlantCalendarView() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [monthRows, setMonthRows] = useState(6);
  const calendarRef = useRef(null);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Listen for reset calendar events
    const resetListener = () => {
      console.log('Reset calendar triggered');
      const today = new Date().toISOString().split('T')[0];
      setSelectedDate(today);
      if (calendarRef.current && 'scrollToMonth' in calendarRef.current) {
        (calendarRef.current as any).scrollToMonth(today);
      }
    };

    // Add listener
    eventEmitter.on('resetCalendar', resetListener);

    // Cleanup
    return () => {
      eventEmitter.off('resetCalendar', resetListener);
    };
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user?.uid) return;

      try {
        const userPlantsRef = collection(db, 'userProfiles', user.uid, 'calendar');
        const q = query(userPlantsRef);
        const querySnapshot = await getDocs(q);
        
        const fetchedEvents = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.date,
            plant: data.plant
          };
        });

        console.log('Fetched events:', fetchedEvents);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [user?.uid]);

  const calendarHeight = monthRows === 5 ? 300 : 340;

  const getMarkedDates = () => {
    const marked = {};
    
    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = { 
        selected: true, 
        selectedColor: '#d6844b',
        plants: [] // Initialize plants array
      };
    }

    // Add this console log to see what events we have
    console.log('Events for marking:', events);

    // Group events by date
    events.forEach(event => {
      if (!event?.date) {
        console.log('Event missing date:', event);
        return;
      }

      // Initialize if date doesn't exist in marked
      if (!marked[event.date]) {
        marked[event.date] = {
          plants: [],
          customStyles: {
            container: {
              backgroundColor: 'transparent',
            },
          }
        };
      }

      // Make sure plants array exists
      if (!marked[event.date].plants) {
        marked[event.date].plants = [];
      }

      // Add plant if it exists
      if (event.plant) {
        marked[event.date].plants.push(event.plant);
      }
    });

    // Add this console log to see final marked dates
    console.log('Final marked dates:', marked);

    return marked;
  };

  return (
    <View style={styles.container}>
      <CalendarList
        ref={calendarRef}
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={getMarkedDates()}
        onMonthChange={(month) => {
          // Format the month correctly
          const monthStr = `${month.year}-${String(month.month).padStart(2, '0')}-01`;
          setCurrentMonth(monthStr);
          
          // Calculate rows
          const firstDay = new Date(month.year, month.month - 1, 1).getDay();
          const daysInMonth = new Date(month.year, month.month, 0).getDate();
          const rows = Math.ceil((firstDay + daysInMonth) / 7);
          setMonthRows(rows);
        }}
        // Horizontal scrolling properties
        horizontal={true}
        pagingEnabled={true}
        pastScrollRange={12}
        futureScrollRange={12}
        scrollEnabled={true}
        showScrollIndicator={false}
        calendarHeight={calendarHeight}
        // Style customization
        style={styles.calendar}
        // Calendar-specific properties
        hideExtraDays={false}
        firstDay={1}
        theme={{
          // Colors
          calendarBackground: '#fff',
          monthTextColor: '#5a6736',
          textSectionTitleColor: '#5a6736',
          selectedDayBackgroundColor: '#d6844b',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#d6844b',
          dayTextColor: '#5a6736',
          textDisabledColor: '#d5d5d5',
          arrowColor: '#5a6736',

          // Font families - use only supported properties
          textDayFontFamily: typography.calendar.dayText.fontFamily,
          textMonthFontFamily: typography.calendar.monthText.fontFamily,
          textDayHeaderFontFamily: typography.calendar.dayHeader.fontFamily,

          // Font sizes
          textDayFontSize: typography.calendar.dayText.fontSize,
          textMonthFontSize: typography.calendar.monthText.fontSize,
          textDayHeaderFontSize: typography.calendar.dayHeader.fontSize,
        }}
        dayComponent={({date, state, marking}) => {
          const plants = marking?.plants || []; // Expect an array of plants
          const isSelected = marking?.selected;
          
          return (
            <TouchableOpacity 
              style={[
                styles.dayContainer,
                isSelected && styles.selectedContainer
              ]}
              onPress={() => {
                setSelectedDate(date.dateString);
                if (plants.length > 1) {
                  // Optionally show a modal or alert with all plants for this date
                  Alert.alert(
                    'Planting Day',
                    `Plants to plant:\n${plants.map(p => p.displayName).join('\n')}`
                  );
                }
              }}
            >
              {plants.length > 0 ? (
                <View style={styles.multiplePlantsContainer}>
                  {plants.length > 1 ? (
                    // Show stacked effect for multiple plants
                    <>
                      <Image 
                        source={{ uri: plants[0].imageUrl }}
                        style={[
                          styles.plantImageBack,
                          isSelected && styles.selectedPlantImage
                        ]}
                        defaultSource={require('@/assets/images/plant-calendar-logo.png')}
                      />
                      <Image 
                        source={{ uri: plants[1].imageUrl }}
                        style={[
                          styles.plantImageFront,
                          isSelected && styles.selectedPlantImage
                        ]}
                        defaultSource={require('@/assets/images/plant-calendar-logo.png')}
                      />
                      {plants.length > 2 && (
                        <View style={styles.extraPlantsIndicator}>
                          <Text style={styles.extraPlantsText}>+{plants.length - 2}</Text>
                        </View>
                      )}
                    </>
                  ) : (
                    // Single plant
                    <Image 
                      source={{ uri: plants[0].imageUrl }}
                      style={[
                        styles.plantImage,
                        isSelected && styles.selectedPlantImage
                      ]}
                      defaultSource={require('@/assets/images/plant-calendar-logo.png')}
                    />
                  )}
                </View>
              ) : (
                <Text style={[
                  styles.dayText,
                  state === 'disabled' && styles.disabledText,
                  isSelected && styles.selectedText
                ]}>
                  {date.day}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />
      <View style={[
        styles.agendaContainer,
        { marginTop: monthRows === 5 ? -40 : 0 }
      ]}>
        <PlantAgendaList selectedDate={selectedDate} currentMonth={currentMonth} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  calendar: {
    borderWidth: 0,
    borderRadius: 10,
  },
  agendaContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dayContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  plantImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  dayText: {
    fontSize: 16,
    fontFamily: typography.calendar.dayText.fontFamily,
  },
  disabledText: {
    color: '#d5d5d5',
  },
  selectedText: {
    color: '#ffffff',
  },
  selectedContainer: {
    backgroundColor: '#d6844b',
    borderRadius: 16,
  },
  selectedPlantImage: {
    borderWidth: 2,
    borderColor: '#d6844b',
  },
  multiplePlantsContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  plantImageBack: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 16,
    top: 0,
    left: 0,
    opacity: 0.7,
  },
  plantImageFront: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 16,
    bottom: 0,
    right: 0,
  },
  extraPlantsIndicator: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#d6844b',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraPlantsText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 