import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { typography } from '@/app/theme/typography';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#d6844b',
        tabBarInactiveTintColor: '#c4cb89',
        headerShown: useClientOnlyValue(false, true),
        tabBarLabelStyle: typography.tabBar,
        headerTitleStyle: {
          fontFamily: 'PoppinsSemiBold',
          fontSize: 20,
          color: '#5a6736',
        },
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
