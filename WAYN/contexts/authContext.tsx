import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { db, User } from '../utils/supabase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  selectUser: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  selectUser: async () => {},
  signOut: async () => {},
  refreshCurrentUser: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const CURRENT_USER_KEY = '@wayn_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load saved user on mount
  useEffect(() => {
    loadSavedUser();
  }, []);

  // Auto-deactivate user when app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (currentUser) {
          console.log('🔴 App going to background, marking user inactive:', currentUser.id);
          try {
            await db
              .from('users')
              .update({ is_active: false })
              .eq('id', currentUser.id);
          } catch (error) {
            console.error('Error deactivating user on background:', error);
          }
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [currentUser?.id]);

  const loadSavedUser = async () => {
    try {
      // DEVELOPMENT MODE: Clear saved user on every app launch
      if (__DEV__) {
        // Get the previously saved user ID
        const savedUserId = await AsyncStorage.getItem(CURRENT_USER_KEY);
        
        // If there was a saved user, mark them as inactive
        if (savedUserId) {
          console.log('🔄 Clearing previous user on dev launch:', savedUserId);
          await db
            .from('users')
            .update({ is_active: false })
            .eq('id', savedUserId);
        }
        
        // Clear the saved user
        await AsyncStorage.removeItem(CURRENT_USER_KEY);
        setLoading(false);
        return;
      }

      // PRODUCTION MODE: Load saved user
      const savedUserId = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (savedUserId) {
        const { data, error } = await db
          .from('users')
          .select('*')
          .eq('id', savedUserId)
          .single();

        if (!error && data) {
          setCurrentUser(data);
          // Set this user as active
          await db
            .from('users')
            .update({ is_active: true })
            .eq('id', savedUserId);
        } else {
          // Clear invalid saved user
          await AsyncStorage.removeItem(CURRENT_USER_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading saved user:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCurrentUser = async () => {
    try {
      const savedUserId =
        currentUser?.id || (await AsyncStorage.getItem(CURRENT_USER_KEY));

      if (!savedUserId) {
        return;
      }

      const { data, error } = await db
        .from('users')
        .select('*')
        .eq('id', savedUserId)
        .single();

      if (!error && data) {
        setCurrentUser(data);
        await AsyncStorage.setItem(CURRENT_USER_KEY, savedUserId);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const selectUser = async (userId: string) => {
    try {
      console.log('🔵 Attempting to select user:', userId);
      
      // Check if this user is already active on another device
      const { data: existingUser } = await db
        .from('users')
        .select('is_active, display_name')
        .eq('id', userId)
        .single();

      console.log('🔵 User status check:', existingUser);

      if (existingUser?.is_active) {
        throw new Error(`${existingUser.display_name} is already logged in on another device`);
      }

      // Mark ONLY the previous user as inactive (if switching users)
      if (currentUser && currentUser.id !== userId) {
        console.log('🔵 Marking previous user as inactive:', currentUser.id);
        await db
          .from('users')
          .update({ is_active: false })
          .eq('id', currentUser.id);
      }

      // Get the selected user
      const { data, error } = await db
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      console.log('🔵 Marking new user as active:', userId);
      
      // Mark as active
      await db
        .from('users')
        .update({ is_active: true })
        .eq('id', userId);

      setCurrentUser(data);
      await AsyncStorage.setItem(CURRENT_USER_KEY, userId);
      
      console.log('✅ User selected successfully:', userId);
    } catch (error: any) {
      console.error('❌ Error selecting user:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (currentUser) {
        console.log('🔴 Signing out, marking user inactive:', currentUser.id);
        // Mark user as inactive
        await db
          .from('users')
          .update({ is_active: false })
          .eq('id', currentUser.id);
      }
      
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        selectUser,
        signOut,
        refreshCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};