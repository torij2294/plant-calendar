import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { PlantAgendaList } from './PlantAgendaList';

export default function PlantCalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <View style={styles.container}>
      <CalendarList
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#2f95dc' }
        }}
        theme={{
          todayTextColor: '#2f95dc',
          selectedDayBackgroundColor: '#2f95dc',
          calendarBackground: '#ffffff',
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
      <PlantAgendaList selectedDate={selectedDate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  }
}); 