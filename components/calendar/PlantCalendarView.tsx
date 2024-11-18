import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { PlantAgendaList } from './PlantAgendaList';

export default function PlantCalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthRows, setMonthRows] = useState(6);

  return (
    <View style={styles.container}>
      <CalendarList
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
        style={{
          height: monthRows === 5 ? 300 : 340  // Adjust these values as needed
        }}
        // Horizontal scrolling properties
        horizontal={true}
        pagingEnabled={true}
        pastScrollRange={12}
        futureScrollRange={12}
        scrollEnabled={true}
        showScrollIndicator={false}
        calendarHeight={320}
        // Style customization
        style={{
          borderWidth: 0,
          borderRadius: 10,
        }}
        // Calendar-specific properties
        hideExtraDays={false}
        firstDay={1}
      />
      <View style={[
        styles.agendaContainer,
        { marginTop: monthRows === 5 ? -40 : 0 }  // Adjust this value as needed
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
  agendaContainer: {
    flex: 1,
  }
}); 