import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { PlantAgendaList } from './PlantAgendaList';
import { typography } from '@/theme/typography';
import { eventEmitter } from '@/services/eventEmitter';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { parseISO, format, isSameDay } from 'date-fns';

export default function PlantCalendarView() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM-dd'));
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

    // Add listener for new plants
    const unsubscribe = eventEmitter.on('plantAdded', fetchEvents);

    return () => {
      eventEmitter.off('plantAdded', unsubscribe);
    };
  }, [user?.uid]);

  const getMarkedDates = () => {
    const marked = {};
    const today = new Date().toISOString().split('T')[0];
    
    // Mark today's date with a circle
    marked[today] = {
      customStyles: {
        container: {
          borderColor: '#694449',
          borderWidth: 1,
          borderRadius: 18,
        }
      },
      marked: true,
      dotColor: '#694449'
    };

    // Add existing plant markers
    events.forEach(event => {
      if (!event?.date) return;

      marked[event.date] = {
        plants: marked[event.date]?.plants || [],
        customStyles: {
          container: {
            backgroundColor: 'transparent',
            ...(event.date === today && {
              borderColor: '#694449',
              borderWidth: 1,
              borderRadius: 18,
            })
          }
        }
      };

      if (event.plant) {
        marked[event.date].plants.push(event.plant);
      }
    });

    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#d6844b',
        plants: marked[selectedDate]?.plants || [],
        customStyles: {
          container: {
            ...(marked[selectedDate]?.customStyles?.container || {}),
            ...(selectedDate === today && {
              borderColor: '#694449',
              borderWidth: 1,
              borderRadius: 18,
            })
          }
        }
      };
    }

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
          console.log('Month changed:', month);
          const formattedMonth = format(new Date(month.timestamp), 'yyyy-MM-dd');
          console.log('Setting month to:', formattedMonth);
          setCurrentMonth(formattedMonth);
        }}
        onVisibleMonthsChange={months => {
          if (months[0]) {
            setCurrentMonth(months[0].dateString);
          }
        }}
        horizontal={true}
        pagingEnabled={true}
        style={styles.calendar}
        hideArrows={true}
        hideExtraDays={true}
        pastScrollRange={12}
        futureScrollRange={12}
        scrollEnabled={true}
        showScrollIndicator={false}
        theme={{
          calendarBackground: '#f5eef0',
          monthTextColor: '#694449',
          arrowColor: '#ab8d91',
          textDayHeaderFontFamily: typography.calendar.dayHeader.fontFamily,
          textMonthFontFamily: typography.calendar.monthText.fontFamily,
          textMonthFontSize: typography.calendar.monthText.fontSize,
          textDayHeaderFontSize: 13,
          dayNamesWidth: 32,
          'stylesheet.calendar.header': {
            header: {
              flexDirection: 'row',
              justifyContent: 'flex-start',
              paddingLeft: 4,
              marginBottom: 0,
              marginTop: 0,
            },
            dayHeader: {
              width: 32,
              textAlign: 'center',
              fontSize: typography.calendar.dayHeader.fontSize,
              fontFamily: typography.calendar.dayHeader.fontFamily,
              color: '#694449', //DAY (Mon, Tues, etc.) TEXT COLOR FOR CALENDAR
              marginTop: 0,
              marginBottom: 7,
            },
          },
        }}
        dayComponent={({ date, state, marking }) => {
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
                  <Image
                    source={{ uri: plants[0].imageUrl }}
                    style={[
                      styles.plantImage,
                      isSelected && styles.selectedPlantImage
                    ]}
                    defaultSource={require('@/assets/images/plant-calendar-logo.png')}
                  />
                  {plants.length > 1 && (
                    <View style={styles.extraPlantsIndicator}>
                      <Text style={styles.extraPlantsText}>+{plants.length - 1}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <Text style={[
                  styles.dayText,
                  state === 'disabled' && styles.disabledText,
                  isSelected && styles.selectedText,
                ]}>
                  {date.day}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
        dayNamesShort={['M', 'T', 'W', 'T', 'F', 'S', 'S']}
        staticHeader={true}
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
  },
  calendar: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    backgroundColor: '#f5eef0',
    marginBottom: 4,
  },
  agendaContainer: {
    flex: 1,
  },
  dayContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  plantImage: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  dayText: {
    fontSize: 20,
    color: '#694449', //DAY #s TEXT COLOR FOR CALENDAR
    fontFamily: typography.calendar.dayText.fontFamily,
  },
  disabledText: {
    color: '#f4dbde',
  },
  selectedText: {
    color: '#ffffff',
  },
  selectedContainer: {
    backgroundColor: '#ddc6c9',
    borderRadius: 18,
  },
  selectedPlantImage: {
    borderWidth: 1,
    borderColor: '#ddc6c9',
  },
  multiplePlantsContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  extraPlantsIndicator: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#694449',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  extraPlantsText: {
    color: 'white',
    fontSize: 10,
    fontFamily: 'PoppinsMedium',
  },
}); 