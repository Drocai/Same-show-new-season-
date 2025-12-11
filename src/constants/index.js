// src/constants/index.js
// Application-wide constants

export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Vibe Rated',
  version: import.meta.env.VITE_APP_VERSION || '2.0.0',
  env: import.meta.env.VITE_APP_ENV || 'development',
};

export const FEATURE_FLAGS = {
  enableRealSensors: import.meta.env.VITE_ENABLE_REAL_SENSORS === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
};

export const MEASUREMENT_CONFIG = {
  duration: 17, // seconds
  sampleRate: 10, // samples per second
  minDuration: 5,
  maxDuration: 30,
};

export const LOCATION_TYPES = [
  { value: 'cafe', label: 'Café', icon: '☕', color: '#8B4513' },
  { value: 'library', label: 'Library', icon: '📚', color: '#4B5563' },
  { value: 'office', label: 'Office', icon: '💼', color: '#3B82F6' },
  { value: 'park', label: 'Park', icon: '🌳', color: '#10B981' },
  { value: 'home', label: 'Home', icon: '🏠', color: '#8B5CF6' },
  { value: 'coworking', label: 'Coworking', icon: '🤝', color: '#F59E0B' },
  { value: 'restaurant', label: 'Restaurant', icon: '🍽️', color: '#EF4444' },
  { value: 'other', label: 'Other', icon: '📍', color: '#6B7280' },
];

export const MAP_CONFIG = {
  tileUrl: import.meta.env.VITE_MAP_TILE_URL || 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  defaultZoom: parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM) || 13,
  minZoom: 3,
  maxZoom: 18,
  defaultCenter: [40.7128, -74.0060], // New York City
};

export const THEME = {
  colors: {
    primary: '#8B5CF6',
    primaryLight: 'rgba(139, 92, 246, 0.2)',
    secondary: '#6366F1',
    bgDark: '#0F172A',
    bgCard: '#1E293B',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.6)',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  transitions: {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '350ms ease',
  },
};

export const STORAGE_KEYS = {
  user: 'vibe_rated_user',
  settings: 'vibe_rated_settings',
  recentLocations: 'vibe_rated_recent_locations',
  offlineQueue: 'vibe_rated_offline_queue',
  lastMeasurement: 'vibe_rated_last_measurement',
};

export const API_ENDPOINTS = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
};

export const VALIDATION = {
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
  },
  location: {
    nameMaxLength: 100,
    addressMaxLength: 200,
    notesMaxLength: 500,
  },
};

export const ERROR_MESSAGES = {
  network: 'Network connection lost. Please check your internet connection.',
  auth: 'Authentication failed. Please try logging in again.',
  sensor: 'Unable to access device sensors. Please grant permissions.',
  location: 'Unable to access your location. Please enable location services.',
  generic: 'Something went wrong. Please try again.',
};

export const SUCCESS_MESSAGES = {
  measurementComplete: 'Measurement complete! Vibrations earned.',
  locationCreated: 'Location created successfully!',
  profileUpdated: 'Profile updated successfully!',
  vibesSent: 'Vibes sent successfully!',
};
