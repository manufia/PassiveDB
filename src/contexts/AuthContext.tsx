import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateMonthlyBudget: (newBudget: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const syncUserProfile = async (user: User) => {
    const userDocPath = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userRef);

      if (snapshot.exists()) {
        setUserProfile(snapshot.data() as UserProfile);
      } else {
        const nowIso = new Date().toISOString();
        const initialProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'ผู้ใช้งาน',
          photoURL: user.photoURL || '',
          monthlyBudget: 15000,
          currency: 'THB',
          createdAt: nowIso,
          updatedAt: nowIso,
        };
        await setDoc(userRef, initialProfile);
        setUserProfile(initialProfile);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, userDocPath);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          await syncUserProfile(user);
        } catch (err) {
          console.error('Failed to sync user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return; // User closed modal, no action needed
      }
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign Out Error:', error);
      throw error;
    }
  };

  const updateMonthlyBudget = async (newBudget: number) => {
    if (!currentUser) return;
    const userDocPath = `users/${currentUser.uid}`;
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updatedAt = new Date().toISOString();
      await updateDoc(userRef, {
        monthlyBudget: newBudget,
        updatedAt,
      });
      setUserProfile((prev) => (prev ? { ...prev, monthlyBudget: newBudget, updatedAt } : null));
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userDocPath);
    }
  };

  const refreshProfile = async () => {
    if (currentUser) {
      await syncUserProfile(currentUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        signInWithGoogle,
        logout,
        updateMonthlyBudget,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
