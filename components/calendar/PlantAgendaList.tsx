import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';

type PlantEvent = {
  id: string;
  plantName: string;
  action: string;
  date: string;
}

export function PlantAgendaList({ selectedDate }: { selectedDate: string }) {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Planting Schedule</Text>
      <FlatList
        style={styles.list}
        data={[]} // This will be populated from API
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.eventItem}>
            <Text style={styles.plantName}>{item.plantName}</Text>
            <Text style={styles.action}>{item.action}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
  },
  list: {
    flex: 1,
  },
  eventItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
  },
  action: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
}); 