import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import * as Google from 'expo-auth-session/providers/google';
import { createUserProfile } from '@/services/user';

// Email/Password Sign Up
export const signUp = async (
  email: string, 
  password: string, 
  firstName: string,
  lastName: string
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;

    // Create user profile using the service
    await createUserProfile(uid, email, firstName, lastName);

    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Email/Password Sign In
export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Google Sign In
export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '245153145160-pilj4ug1di9histrm62goueve11upa7d.apps.googleusercontent.com',
    iosClientId: '245153145160-pilj4ug1di9histrm62goueve11upa7d.apps.googleusercontent.com',
  });

  const handleGoogleAuth = async () => {
    try {
      if (response?.type === 'success') {
        const { id_token } = response.params;
        const credential = GoogleAuthProvider.credential(id_token);
        const userCredential = await signInWithCredential(auth, credential);

        // Create/update user profile using the service
        const names = userCredential.user.displayName?.split(' ') || ['', ''];
        await createUserProfile(
          userCredential.user.uid,
          userCredential.user.email || '',
          names[0],
          names[1]
        );

        return userCredential.user;
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return { request, response, promptAsync, handleGoogleAuth };
}; 