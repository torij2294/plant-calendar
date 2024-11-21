import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export function SignOutButton() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.signOutButton} 
      onPress={handleSignOut}
    >
      <Text style={styles.signOutButtonText}>Sign Out</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  signOutButton: {
    backgroundColor: '#d6844b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    margin: 16,
  },
  signOutButtonText: {
    color: '#fff',
    fontFamily: 'PoppinsSemiBold',
    fontSize: 16,
  },
}); 