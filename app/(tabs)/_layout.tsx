import { eventEmitter } from '@/services/eventEmitter';

import React, { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { typography } from '@/theme/typography';
import { TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { router } from 'expo-router';
import { auth } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

const profileImages = [
  { id: 1, source: require('@/assets/images/profile-images/profile-1.png') },
  { id: 2, source: require('@/assets/images/profile-images/profile-2.png') },
  { id: 3, source: require('@/assets/images/profile-images/profile-3.png') },
  { id: 4, source: require('@/assets/images/profile-images/profile-4.png') },
  { id: 5, source: require('@/assets/images/profile-images/profile-5.png') },
  { id: 6, source: require('@/assets/images/profile-images/profile-6.png') },
  { id: 7, source: require('@/assets/images/profile-images/profile-7.png') },
  { id: 8, source: require('@/assets/images/profile-images/profile-8.png') },
  { id: 9, source: require('@/assets/images/profile-images/profile-9.png') },
  { id: 11, source: require('@/assets/images/profile-images/profile-11.png') },
  { id: 12, source: require('@/assets/images/profile-images/profile-12.png') },
  { id: 13, source: require('@/assets/images/profile-images/profile-13.png') },
];

function TabBarIcon({ name, color }: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} name={name} color={color} />;
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
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);

  // Fetch user data for avatar
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const data = userDoc.data();
        console.log('User data fetched:', data);
        setUserData(data);
      }
    };
    fetchUserData();
  }, [user]);

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
            onPress={() => router.push('/profile')}
            style={{ marginRight: 16 }}
          >
            {userData?.avatar ? (
              <Image
                source={profileImages.find(img => img.id === userData.avatar)?.source}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                }}
                defaultSource={require('@/assets/images/profile-images/profile-1.png')}
              />
            ) : (
              <FontAwesome name="user-circle" size={32} color="#5a6736" />
            )}
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
            <TouchableOpacity 
              onPress={() => {
                console.log('Calendar title pressed');
                eventEmitter.emit('resetCalendar');
              }}
            >
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
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            userData?.avatar ? (
              <Image
                source={profileImages.find(img => img.id === userData.avatar)?.source}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                }}
              />
            ) : (
              <TabBarIcon name="user" color={color} />
            )
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default behavior
            e.preventDefault();
            // Navigate to profile screen
            router.push('/profile');
          },
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
