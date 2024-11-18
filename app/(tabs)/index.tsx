import { StyleSheet, View } from 'react-native';
import PlantCalendarView from '@/components/calendar/PlantCalendarView';

export default function TabOneScreen() {
  return (
    <View style={styles.container}>
      <PlantCalendarView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    paddingTop: 0,
  },
});
