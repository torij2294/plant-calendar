import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { Stack, Redirect, useRootNavigationState } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { PropsWithChildren, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { auth } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet } from 'react-native';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
      cacheTime: 1000 * 60 * 30, // Cache is kept for 30 minutes
    },
  },
});

// Create a custom theme that explicitly disables headers
const customTheme = {
  ...DefaultTheme,
  // Override default navigation theme settings
  colors: {
    ...DefaultTheme.colors,
    background: '#f5eef0',  // Match your app's background color
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts ({
    'Poppins': Poppins_400Regular,
    'PoppinsMedium': Poppins_500Medium,
    'PoppinsSemiBold': Poppins_600SemiBold,
    'PoppinsBold': Poppins_700Bold,
    ...FontAwesome.font,
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(console.error);
    }
  }, [loaded]);

  if (error) {
    throw error;
  }

  // Wait for fonts to be ready
  if (!loaded) {
    return <Loading />
  }

  return (
    <ThemeProvider value={customTheme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Stack
            screenOptions={{
              headerShown: false,  // Default for all screens
              contentStyle: { backgroundColor: '#f5eef0' },
            }}
          >
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <AuthGuard>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="welcome" />
              <Stack.Screen name="profile" options={{ headerShown: true }} />
              <Stack.Screen name="plant/[id]" options={{ headerShown: true }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </AuthGuard>
          </Stack>
          <DevMenu />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

function AuthGuard (props: PropsWithChildren) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <>{props.children}</>;
}

function Loading() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Text>Loading...</Text>
    </View>
  )
}

function DevMenu() {
  const { clearAuth } = useAuth();

  if (__DEV__) {
    return (
      <View style={styles.devMenu}>
        <TouchableOpacity 
          onPress={clearAuth}
          style={styles.devButton}
        >
          <Text style={styles.devButtonText}>Clear Auth</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  devMenu: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  devButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 8,
  },
  devButtonText: {
    color: 'white',
    fontSize: 12,
  },
});