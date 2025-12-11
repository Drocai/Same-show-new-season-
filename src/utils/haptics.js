// src/utils/haptics.js

/**
 * Haptic Feedback Utility
 * Provides tactile feedback for user interactions across the app
 */

// Check if haptic feedback is supported
const isHapticsSupported = () => {
  return (
    'vibrate' in navigator ||
    'Vibration' in window ||
    (window.navigator && 'vibrate' in window.navigator)
  );
};

// Check if user has enabled haptics (from settings)
const isHapticsEnabled = () => {
  const enabled = localStorage.getItem('haptics_enabled');
  return enabled === null || enabled === 'true'; // Default to enabled
};

// Set haptics preference
export const setHapticsEnabled = (enabled) => {
  localStorage.setItem('haptics_enabled', enabled.toString());
};

// Vibration patterns for different feedback types
const HAPTIC_PATTERNS = {
  // Light tap - for selections, toggles
  light: [10],
  
  // Medium tap - for button presses
  medium: [20],
  
  // Heavy tap - for important actions
  heavy: [30],
  
  // Success - double tap
  success: [15, 50, 15],
  
  // Error - triple tap
  error: [10, 50, 10, 50, 10],
  
  // Warning - long then short
  warning: [30, 50, 10],
  
  // Selection - very light
  selection: [5],
  
  // Impact - strong single tap
  impact: [40],
  
  // Notification - pattern
  notification: [20, 100, 20, 100, 20],
  
  // Start - ascending
  start: [10, 30, 15, 40, 20],
  
  // Complete - descending
  complete: [20, 40, 15, 30, 10],
  
  // Tick - very light for progress
  tick: [3],
  
  // Heartbeat - rhythmic pattern
  heartbeat: [20, 100, 20, 500, 20, 100, 20],
};

/**
 * Trigger haptic feedback
 * @param {string} type - Type of haptic feedback (light, medium, heavy, success, error, etc.)
 * @param {boolean} force - Force feedback even if disabled
 */
export const hapticFeedback = (type = 'light', force = false) => {
  // Check if haptics are supported and enabled
  if (!isHapticsSupported()) return;
  if (!force && !isHapticsEnabled()) return;

  const pattern = HAPTIC_PATTERNS[type] || HAPTIC_PATTERNS.light;

  try {
    // Try modern Vibration API
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
      return;
    }

    // Fallback for older browsers
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
      return;
    }
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
};

/**
 * Haptic feedback for button press
 */
export const hapticButtonPress = () => {
  hapticFeedback('medium');
};

/**
 * Haptic feedback for toggle switch
 */
export const hapticToggle = () => {
  hapticFeedback('light');
};

/**
 * Haptic feedback for selection
 */
export const hapticSelection = () => {
  hapticFeedback('selection');
};

/**
 * Haptic feedback for success action
 */
export const hapticSuccess = () => {
  hapticFeedback('success');
};

/**
 * Haptic feedback for error
 */
export const hapticError = () => {
  hapticFeedback('error');
};

/**
 * Haptic feedback for warning
 */
export const hapticWarning = () => {
  hapticFeedback('warning');
};

/**
 * Haptic feedback for impact (strong action)
 */
export const hapticImpact = () => {
  hapticFeedback('impact');
};

/**
 * Haptic feedback for notification
 */
export const hapticNotification = () => {
  hapticFeedback('notification');
};

/**
 * Haptic feedback for measurement start
 */
export const hapticMeasurementStart = () => {
  hapticFeedback('start');
};

/**
 * Haptic feedback for measurement complete
 */
export const hapticMeasurementComplete = () => {
  hapticFeedback('complete');
};

/**
 * Haptic feedback for progress tick (during measurement)
 */
export const hapticProgressTick = () => {
  hapticFeedback('tick');
};

/**
 * Haptic feedback for heartbeat (rhythmic feedback)
 */
export const hapticHeartbeat = () => {
  hapticFeedback('heartbeat');
};

/**
 * Custom haptic pattern
 * @param {number[]} pattern - Array of vibration durations in milliseconds
 */
export const hapticCustom = (pattern) => {
  if (!isHapticsSupported() || !isHapticsEnabled()) return;
  
  try {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    } else if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(pattern);
    }
  } catch (error) {
    console.warn('Custom haptic feedback failed:', error);
  }
};

/**
 * Stop all haptic feedback
 */
export const hapticStop = () => {
  if (!isHapticsSupported()) return;
  
  try {
    if (navigator.vibrate) {
      navigator.vibrate(0);
    } else if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(0);
    }
  } catch (error) {
    console.warn('Stop haptic feedback failed:', error);
  }
};

/**
 * Test haptic feedback (for settings page)
 */
export const hapticTest = () => {
  hapticFeedback('medium', true); // Force feedback for testing
};

// Export main function as default
export default hapticFeedback;
