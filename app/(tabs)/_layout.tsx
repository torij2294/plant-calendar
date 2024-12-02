import { eventEmitter } from '@/services/eventEmitter';
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';

import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { typography } from '@/theme/typography';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';
import { router } from 'expo-router';
import { auth } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { AddModal } from '@/components/modals/AddModal';

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
  const [isModalVisible, setIsModalVisible] = useState(false);

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
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#ed9aa4',
          tabBarInactiveTintColor: '#f4dbde',
          headerShown: true,
          tabBarLabelStyle: typography.tabBar,
          headerStyle: {
            backgroundColor: '#f5eef0',
          },
          headerShadowVisible: false,
          headerTitleStyle: {
            fontFamily: 'PoppinsSemiBold',
            fontSize: 20,
            color: '#ddc6c9',
          },
          headerTitleAlign: 'center',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              style={{ 
                marginRight: 20,
                marginBottom: 20 
              }}
            >
              {userData?.avatar ? (
                <Image
                  source={profileImages.find(img => img.id === userData.avatar)?.source}
                  style={{
                    width: 50,
                    height: 50,
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
            backgroundColor: '#f5eef0',
            borderTopWidth: 0,
          },
          tabBarIconStyle: {
            marginBottom: 8,
            width: 32,
            height: 32,
          },
          tabBarShowLabel: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Calendar',
            tabBarIcon: ({ color }) => (
              <Feather name="calendar" size={32} color={color} />
            ),
            tabBarLabel: 'Calendar',
            headerTitleAlign: 'center',
            headerTitle: ({ children }) => (
              <TouchableOpacity 
                onPress={() => {
                  console.log('Calendar title pressed');
                  eventEmitter.emit('resetCalendar');
                }}
                style={styles.headerTitleContainer}
              >
                <Text style={styles.headerTitle}>{children}</Text>
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            tabBarButton: () => (
              <TouchableOpacity
                onPress={() => setIsModalVisible(true)}
                style={{
                  top: -20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <View
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 28,
                    backgroundColor: '#694449',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: "#000",
                    shadowOffset: {
                      width: 0,
                      height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                  }}
                >
                  <Ionicons name="add" size={32} color="white" />
                </View>
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="two"
          options={{
            title: 'Plants',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="leaf" size={32} color={color} />
            ),
            tabBarLabel: 'Plants',
            headerTitleAlign: 'center',
            headerTitle: ({ children }) => (
              <Text style={styles.headerTitle}>{children}</Text>
            ),
          }}
        />
      </Tabs>

      <AddModal 
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontFamily: 'PoppinsBold',
    fontSize: 24, 
    color: '#694449', //"CALENDAR" TITLE TEXT COLOR
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
