import EventEmitter from '@/types/global';

import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { typography } from '@/theme/typography';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { auth } from '@/config/firebase';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

const handleLogout = async () => {
  try {
    await auth.signOut();
    router.replace('/login');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#d6844b',
        tabBarInactiveTintColor: '#c4cb89',
        headerShown: true,
        tabBarLabelStyle: typography.tabBar,
        headerTitleStyle: {
          fontFamily: 'PoppinsSemiBold',
          fontSize: 20,
          color: '#5a6736',
        },
        headerTitleAlign: 'center',
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{ marginRight: 16 }}
          >
            <FontAwesome name="gear" size={24} color="#5a6736" />
          </TouchableOpacity>
        ),
        tabBarStyle: {
          display: 'flex',
          height: 85,
          paddingTop: 12,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTopWidth: 0,
        },
        tabBarIconStyle: {
          marginBottom: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          tabBarLabel: 'Calendar',
          headerTitle: ({ children }) => (
            <TouchableOpacity onPress={() => {
              global.EventEmitter?.emit('resetCalendar');
            }}>
              <Text style={styles.headerTitle}>{children}</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Plants',
          tabBarIcon: ({ color }) => <TabBarIcon name="pagelines" color={color} />,
          tabBarLabel: 'Plants',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: 'PoppinsSemiBold',
    fontSize: 20,
    color: '#5a6736',
  },
});
