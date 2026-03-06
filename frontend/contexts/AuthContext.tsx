'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase';
import api from '@/lib/api';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        localStorage.setItem('fitai_token', token);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        localStorage.removeItem('fitai_token');
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAuthError = (err: unknown): string => {
    if (err && typeof err === 'object' && 'code' in err) {
      const code = (err as { code: string }).code;
      const messages: Record<string, string> = {
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/too-many-requests': 'Too many attempts. Please try again later.',
        'auth/popup-closed-by-user': 'Sign-in popup was closed.',
        'auth/invalid-credential': 'Invalid credentials. Please check and try again.',
      };
      return messages[code] || 'Authentication failed. Please try again.';
    }
    return 'An unexpected error occurred.';
  };

  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const result = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      const token = await result.user.getIdToken();
      localStorage.setItem('fitai_token', token);
    } catch (err) {
      const msg = handleAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(getFirebaseAuth(), provider);
      const token = await result.user.getIdToken();
      localStorage.setItem('fitai_token', token);
    } catch (err) {
      const msg = handleAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const result = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      await updateProfile(result.user, { displayName: name });
      const token = await result.user.getIdToken();
      localStorage.setItem('fitai_token', token);
      try {
        await api.post('/api/auth/register', { name, email });
      } catch {
        // Backend registration optional
      }
    } catch (err) {
      const msg = handleAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    await signOut(getFirebaseAuth());
    localStorage.removeItem('fitai_token');
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
    } catch (err) {
      const msg = handleAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, loginWithGoogle, register, logout, resetPassword, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
}

export default AuthContext;
