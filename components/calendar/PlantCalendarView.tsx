import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Calendar, AgendaList } from 'react-native-calendars';
import { PlantAgendaList } from './PlantAgendaList';

export default function PlantCalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  return (
    <View style={styles.container}>
      <Calendar
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: '#2f95dc' }
        }}
        theme={{
          todayTextColor: '#2f95dc',
          selectedDayBackgroundColor: '#2f95dc',
        }}
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