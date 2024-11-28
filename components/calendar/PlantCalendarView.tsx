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
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0]);
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

  // Add this to track month changes
  useEffect(() => {
    console.log('Current month state changed to:', currentMonth);
  }, [currentMonth]);

  return (
    <View style={styles.container}>
      <CalendarList
        ref={calendarRef}
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={getMarkedDates()}
        onMonthChange={(month) => {
          // Use the timestamp from the month object
          console.log('Month changed:', month);
          const newDate = new Date(month.timestamp);
          const formattedMonth = newDate.toISOString().split('T')[0];
          console.log('Setting month to:', formattedMonth);
          setCurrentMonth(formattedMonth);

          // Calculate rows
          const firstDay = newDate.getDay();
          const daysInMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
          const rows = Math.ceil((firstDay + daysInMonth) / 7);
          setMonthRows(rows);
        }}
        horizontal={true}
        pagingEnabled={true}
        calendarHeight={calendarHeight}
        pastScrollRange={12}
        futureScrollRange={12}
        scrollEnabled={true}
        showScrollIndicator={false}
        style={styles.calendar}
        hideExtraDays={false}
        firstDay={1}
        theme={{
          calendarBackground: '#f2eee4',
          monthTextColor: '#5a6736',
          textSectionTitleColor: '#5a6736',
          selectedDayBackgroundColor: '#d6844b',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#d6844b',
          dayTextColor: '#5a6736',
          textDisabledColor: '#d5d5d5',
          arrowColor: '#5a6736',
          textDayFontFamily: typography.calendar.dayText.fontFamily,
          textMonthFontFamily: typography.calendar.monthText.fontFamily,
          textDayHeaderFontFamily: typography.calendar.dayHeader.fontFamily,
          textDayFontSize: typography.calendar.dayText.fontSize,
          textMonthFontSize: typography.calendar.monthText.fontSize,
          textDayHeaderFontSize: 13,
          dayNamesWidth: 32,
          dayNamesShort: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
          'stylesheet.calendar.header': {
            dayHeader: {
              width: 32,
              textAlign: 'center',
              fontSize: typography.calendar.dayHeader.fontSize,
              fontFamily: typography.calendar.dayHeader.fontFamily,
              color: '#5a6736',
              marginTop: 2,
              marginBottom: 7,
            },
          },
        }}
        dayComponent={({date, state, marking}) => {
          const plants = marking?.plants || [];
          const isSelected = marking?.selected;
          
          return (
            <TouchableOpacity 
              style={[
                styles.dayContainer,
                isSelected && styles.selectedContainer
              ]}
              onPress={() => setSelectedDate(date.dateString)}
            >
              {plants.length > 0 ? (
                <View style={styles.multiplePlantsContainer}>
                  {plants.length > 1 ? (
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
                  isSelected && styles.selectedText,
                  { color: '#5a6736' }
                ]}>
                  {date.day}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
        dayNamesShort={['M', 'T', 'W', 'T', 'F', 'S', 'S']}
      />
      <View style={[
        styles.agendaContainer,
        { marginTop: -20 }
      ]}>
        <PlantAgendaList 
          key={currentMonth}
          selectedDate={selectedDate} 
          currentMonth={currentMonth}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2eee4',
  },
  calendar: {
    marginBottom: -20,
  },
  agendaContainer: {
    flex: 1,
    minHeight: 300,
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
  extraPlantsText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
}); 