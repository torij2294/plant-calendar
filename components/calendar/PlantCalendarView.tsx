import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { PlantAgendaList } from './PlantAgendaList';
import { typography } from '@/theme/typography';
import { eventEmitter } from '@/services/eventEmitter';

export default function PlantCalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthRows, setMonthRows] = useState(6);
  const calendarRef = useRef(null);

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

  const calendarHeight = monthRows === 5 ? 300 : 340;

  return (
    <View style={styles.container}>
      <CalendarList
        ref={calendarRef}
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#d6844b' }
        }}
        onMonthChange={(month) => {
          // Calculate number of rows needed for this month
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
      />
      <View style={[
        styles.agendaContainer,
        { marginTop: monthRows === 5 ? -40 : 0 }
      ]}>
        <PlantAgendaList selectedDate={selectedDate} />
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
  }
}); 