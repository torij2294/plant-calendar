import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlantTile } from '@/components/plants/PlantTile';
import { format } from 'date-fns';

interface CalendarEventItemProps {
  event: {
    plantId: string;
    date: string;
    plant: Plant; // You'll need to fetch the plant data
  };
}

export function CalendarEventItem({ event }: CalendarEventItemProps) {
  return (
    <View style={styles.container}>
      <PlantTile 
        plant={event.plant}
        onPress={() => {}}
        plantingDate={format(new Date(event.date), 'MMM d, yyyy')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
}); 