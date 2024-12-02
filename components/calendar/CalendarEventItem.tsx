import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlantTile } from '@/components/plants/PlantTile';
import { format, parseISO } from 'date-fns';
import { Plant } from '@/types/plants';

interface CalendarEventItemProps {
  event: {
    plantId: string;
    date: string;
    plant: Plant;
  };
}

export function CalendarEventItem({ event }: CalendarEventItemProps) {
  return (
    <View style={styles.container}>
      <PlantTile 
        plant={event.plant}
        onPress={() => {}}
        plantingDate={event.date}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
}); 