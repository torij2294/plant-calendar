import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/config/firebase';
import { User } from 'firebase/auth';
import { router, usePathname, useSegments } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const segments = useSegments();

  useEffect(() => {
    console.log('AuthProvider initializing...');
    
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'No user');
      setUser(user);
      
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          console.log('User data:', userData);
          
          setTimeout(() => {
            if (!userData?.setupComplete) {
              router.replace('/welcome');
            } else if (pathname === '/welcome') {
              router.replace('/(tabs)');
            }
          }, 0);
        } else if (pathname !== '/login' && pathname !== '/signup') {
          setTimeout(() => {
            router.replace('/login');
          }, 0);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [pathname]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 