import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import api from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  logout: () => Promise<void>;
  isLoading: boolean;
  syncBackendUser: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync token with backend to get local user profile (role, id, etc.)
  const syncBackendUser = async (token: string) => {
    try {
      // In a real app, you'd send the token to the backend to verify and return the local user
      // For now, we simulate a response since the backend /auth/firebase route might not be ready
      const res = await api.post('/auth/firebase-login', { token }).catch(() => null);
      if (res && res.data) {
        setUser(res.data.user);
        localStorage.setItem('token', res.data.access_token);
      } else {
        // Fallback if backend isn't ready
        setUser({ id: 999, name: auth.currentUser?.displayName || 'Firebase User', email: auth.currentUser?.email || '', role: 'citizen' });
        localStorage.setItem('token', token);
      }
    } catch (error) {
      console.error("Backend sync failed", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setFirebaseUser(currUser);
      if (currUser) {
        const token = await currUser.getIdToken();
        await syncBackendUser(token);
      } else {
        setUser(null);
        localStorage.removeItem('token');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, logout, isLoading, syncBackendUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
