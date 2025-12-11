// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email, password, username) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });
  
  if (data.user && !error) {
    // Create profile
    await supabase.from('profiles').insert({
      id: data.user.id,
      username,
      vibrations: 50, // Welcome bonus
      resonance_rank: 1
    });
  }
  
  return { data, error };
};

export const signIn = async (email, password) => {
  return supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const getUser = () => supabase.auth.getUser();

// Profile helpers
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, rank_thresholds!inner(*)')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateProfile = async (userId, updates) => {
  return supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
};

// Location helpers
export const getLocations = async (filters = {}) => {
  let query = supabase
    .from('locations')
    .select('*')
    .order('avg_vibe_score', { ascending: false });
  
  if (filters.type) {
    query = query.eq('location_type', filters.type);
  }
  
  if (filters.lat && filters.lng && filters.radius) {
    // Simple bounding box filter (Supabase doesn't have PostGIS by default)
    const latDelta = filters.radius / 111; // ~111km per degree
    const lngDelta = filters.radius / (111 * Math.cos(filters.lat * Math.PI / 180));
    
    query = query
      .gte('latitude', filters.lat - latDelta)
      .lte('latitude', filters.lat + latDelta)
      .gte('longitude', filters.lng - lngDelta)
      .lte('longitude', filters.lng + lngDelta);
  }
  
  return query.limit(50);
};

export const getLocation = async (locationId) => {
  return supabase
    .from('locations')
    .select('*')
    .eq('id', locationId)
    .single();
};

export const createLocation = async (location) => {
  return supabase
    .from('locations')
    .insert(location)
    .select()
    .single();
};

// Measurement helpers
export const saveMeasurement = async (measurement) => {
  return supabase
    .from('measurements')
    .insert(measurement)
    .select()
    .single();
};

export const getLocationMeasurements = async (locationId, limit = 20) => {
  return supabase
    .from('measurements')
    .select('*, profiles(username, avatar_url)')
    .eq('location_id', locationId)
    .order('created_at', { ascending: false })
    .limit(limit);
};

export const getUserMeasurements = async (userId, limit = 50) => {
  return supabase
    .from('measurements')
    .select('*, locations(name, location_type)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
};

// Resonance / Leaderboard helpers
export const getLeaderboard = async (limit = 20) => {
  return supabase
    .from('profiles')
    .select('id, username, avatar_url, vibrations, resonance_rank, total_measurements')
    .order('vibrations', { ascending: false })
    .limit(limit);
};

export const sendVibes = async (fromUserId, toUserId, amount = 10) => {
  // Deduct from sender
  const { error: deductError } = await supabase.rpc('send_vibes', {
    sender_id: fromUserId,
    receiver_id: toUserId,
    amount
  });
  
  return { error: deductError };
};

export const getRankThresholds = async () => {
  return supabase
    .from('rank_thresholds')
    .select('*')
    .order('rank');
};
