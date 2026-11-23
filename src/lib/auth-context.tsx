'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, UserRole } from '@/types/database';
import { StoreManager, AppState } from '@/lib/store';

export interface AuthContextType {
  currentUser: Profile | null;
  currentRole: UserRole | null;
  storeState: AppState;
  isHydrated: boolean;
  switchUser: (user: Profile) => void;
  logout: () => void;
  resetAllData: () => void;
  refreshStore: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ACTIVE_USER_STORAGE_KEY = 'INTERNTRACK_ACTIVE_USER_ID_V3';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const store = StoreManager.getInstance();
  const [storeState, setStoreState] = useState<AppState>(store.getState());
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to store updates
    const unsubscribe = store.subscribe(() => {
      setStoreState({ ...store.getState() });
    });

    const state = store.getState();
    let userToSet: Profile | undefined = undefined;

    // Check if user previously logged in
    if (typeof window !== 'undefined') {
      const savedUserId = localStorage.getItem(ACTIVE_USER_STORAGE_KEY) || sessionStorage.getItem(ACTIVE_USER_STORAGE_KEY);
      if (savedUserId) {
        userToSet = state.profiles.find((p) => p.id === savedUserId);
      }
    }

    // Set authenticated user if found; otherwise leave null (unauthenticated)
    if (userToSet) {
      setCurrentUser(userToSet);
    } else {
      setCurrentUser(null);
    }

    setIsHydrated(true);

    return () => unsubscribe();
  }, []);

  const switchUser = (user: Profile) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, user.id);
      sessionStorage.setItem(ACTIVE_USER_STORAGE_KEY, user.id);
      window.dispatchEvent(new CustomEvent('interntrack-user-switched', { detail: user }));
    }
    store.notify();
  };

  const logout = () => {
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
      sessionStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('interntrack-user-logged-out'));
    }
    store.notify();
  };

  const resetAllData = () => {
    store.resetState();
    setStoreState({ ...store.getState() });
    logout();
  };

  const refreshStore = () => {
    setStoreState({ ...store.getState() });
  };

  const currentRole: UserRole | null = currentUser?.role || null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        storeState,
        isHydrated,
        switchUser,
        logout,
        resetAllData,
        refreshStore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
