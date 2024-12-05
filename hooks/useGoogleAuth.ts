import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/config/firebase';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleAuth() {
  console.log('Initializing useGoogleAuth hook');
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    selectAccount: true,
  });

  console.log('Auth request status:', {
    hasRequest: !!request,
    clientIds: {
      android: !!process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      ios: !!process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      web: !!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    }
  });

  const handleGoogleAuth = async () => {
    try {
      console.log('handleGoogleAuth called');
      
      if (!request) {
        console.log('No request object available');
        return null;
      }

      console.log('Calling promptAsync');
      const response = await promptAsync();
      console.log('promptAsync response:', response);

      return response;
    } catch (error) {
      console.error('Error in handleGoogleAuth:', error);
      throw error;
    }
  };

  return {
    handleGoogleAuth,
    isLoading: !!request
  };
} 