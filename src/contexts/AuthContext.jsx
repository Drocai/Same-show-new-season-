// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getProfile } from '../lib/supabase';
import { storage } from '../utils';
import { STORAGE_KEYS } from '../constants';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing session
    checkUser();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        storage.remove(STORAGE_KEYS.user);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await loadUserProfile(user);
      } else {
        // Try to load from local storage (demo mode)
        const cachedUser = storage.get(STORAGE_KEYS.user);
        if (cachedUser) {
          setUser(cachedUser);
          setProfile(cachedUser);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async (user) => {
    try {
      const { data, error } = await getProfile(user.id);
      if (error) throw error;
      
      setUser(user);
      setProfile(data);
      storage.set(STORAGE_KEYS.user, data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setError(error.message);
    }
  };

  const signUp = async (email, password, username) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });

      if (error) throw error;

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          username,
          vibrations: 50, // Welcome bonus
          resonance_rank: 1,
        });

        if (profileError) throw profileError;
        await loadUserProfile(data.user);
      }

      return { data, error: null };
    } catch (error) {
      setError(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        await loadUserProfile(data.user);
      }

      return { data, error: null };
    } catch (error) {
      setError(error.message);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);
      storage.remove(STORAGE_KEYS.user);

      return { error: null };
    } catch (error) {
      setError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      storage.set(STORAGE_KEYS.user, updatedProfile);

      return { error: null };
    } catch (error) {
      setError(error.message);
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    await loadUserProfile(user);
  };

  // Demo mode: Use local user without authentication
  const useDemoMode = () => {
    const demoUser = {
      id: 'demo-user',
      email: 'demo@viberated.app',
      username: 'VibeSeeker',
      vibrations: 347,
      resonance_rank: 2,
      total_measurements: 23,
      streak_days: 5,
      badges: [
        { id: 'first_vibe', earned_at: new Date().toISOString() },
        { id: 'early_bird', earned_at: new Date().toISOString() },
        { id: 'streak_3', earned_at: new Date().toISOString() },
      ],
    };

    setUser(demoUser);
    setProfile(demoUser);
    storage.set(STORAGE_KEYS.user, demoUser);
    setLoading(false);
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile,
    useDemoMode,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
