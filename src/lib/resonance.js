// src/lib/resonance.js
// Resonance Gamification System - Vibrations, Ranks, and Rewards

export const RANKS = [
  { rank: 1, name: 'Listener', minVibrations: 0, icon: '👂', color: '#6B7280', description: 'Just starting to sense the vibes' },
  { rank: 2, name: 'Sensor', minVibrations: 100, icon: '📡', color: '#3B82F6', description: 'Developing frequency awareness' },
  { rank: 3, name: 'Resonator', minVibrations: 500, icon: '🔊', color: '#8B5CF6', description: 'In tune with the environment' },
  { rank: 4, name: 'Harmonizer', minVibrations: 1500, icon: '🎵', color: '#EC4899', description: 'Creating balanced spaces' },
  { rank: 5, name: 'Frequency Master', minVibrations: 5000, icon: '⚡', color: '#F59E0B', description: 'Master of environmental frequencies' }
];

export const BADGES = [
  { id: 'first_vibe', name: 'First Vibe', icon: '🎉', description: 'Complete your first measurement' },
  { id: 'early_bird', name: 'Early Bird', icon: '🌅', description: 'Measure before 7 AM' },
  { id: 'night_owl', name: 'Night Owl', icon: '🦉', description: 'Measure after 10 PM' },
  { id: 'cafe_hunter', name: 'Café Hunter', icon: '☕', description: 'Rate 10 different cafés' },
  { id: 'library_lover', name: 'Library Lover', icon: '📚', description: 'Rate 5 libraries' },
  { id: 'streak_3', name: '3-Day Streak', icon: '🔥', description: 'Measure 3 days in a row' },
  { id: 'streak_7', name: 'Week Warrior', icon: '💪', description: 'Measure 7 days in a row' },
  { id: 'streak_30', name: 'Monthly Master', icon: '🏆', description: 'Measure 30 days in a row' },
  { id: 'perfect_10', name: 'Perfect 10', icon: '💯', description: 'Find a location with 10/10 comfort' },
  { id: 'vibe_giver', name: 'Vibe Giver', icon: '💝', description: 'Send vibes to 10 different users' },
  { id: 'explorer', name: 'Explorer', icon: '🗺️', description: 'Rate locations in 5 different cities' }
];

// Calculate vibrations earned for a measurement
export function calculateVibrations(measurement, streakDays = 0) {
  let base = 10;
  
  // Quality bonus: higher vibe scores earn more
  if (measurement.vibeScore >= 80) base += 5;
  if (measurement.vibeScore >= 90) base += 10;
  
  // Streak multiplier
  const streakMultiplier = Math.min(1 + (streakDays * 0.1), 2.0); // Max 2x
  
  // First measurement of the day bonus
  const dailyBonus = measurement.isFirstToday ? 5 : 0;
  
  // New location bonus
  const newLocationBonus = measurement.isNewLocation ? 15 : 0;
  
  return Math.round((base * streakMultiplier) + dailyBonus + newLocationBonus);
}

// Get current rank from vibrations
export function getRank(vibrations) {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (vibrations >= RANKS[i].minVibrations) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

// Get next rank and progress
export function getRankProgress(vibrations) {
  const currentRank = getRank(vibrations);
  const nextRankIndex = currentRank.rank; // Since ranks are 1-indexed
  
  if (nextRankIndex >= RANKS.length) {
    return { current: currentRank, next: null, progress: 100, toNext: 0 };
  }
  
  const nextRank = RANKS[nextRankIndex];
  const rangeStart = currentRank.minVibrations;
  const rangeEnd = nextRank.minVibrations;
  const progress = ((vibrations - rangeStart) / (rangeEnd - rangeStart)) * 100;
  const toNext = rangeEnd - vibrations;
  
  return { current: currentRank, next: nextRank, progress: Math.min(progress, 100), toNext };
}

// Check for level up
export function checkLevelUp(oldVibrations, newVibrations) {
  const oldRank = getRank(oldVibrations);
  const newRank = getRank(newVibrations);
  
  if (newRank.rank > oldRank.rank) {
    return newRank;
  }
  return null;
}

// Check badge eligibility
export function checkBadges(userStats, measurement) {
  const earnedBadges = [];
  const currentBadges = userStats.badges || [];
  
  const hasBadge = (id) => currentBadges.some(b => b.id === id);
  
  // First measurement
  if (userStats.totalMeasurements === 1 && !hasBadge('first_vibe')) {
    earnedBadges.push(BADGES.find(b => b.id === 'first_vibe'));
  }
  
  // Time-based badges
  const hour = new Date().getHours();
  if (hour < 7 && !hasBadge('early_bird')) {
    earnedBadges.push(BADGES.find(b => b.id === 'early_bird'));
  }
  if (hour >= 22 && !hasBadge('night_owl')) {
    earnedBadges.push(BADGES.find(b => b.id === 'night_owl'));
  }
  
  // Streak badges
  if (userStats.streakDays >= 3 && !hasBadge('streak_3')) {
    earnedBadges.push(BADGES.find(b => b.id === 'streak_3'));
  }
  if (userStats.streakDays >= 7 && !hasBadge('streak_7')) {
    earnedBadges.push(BADGES.find(b => b.id === 'streak_7'));
  }
  if (userStats.streakDays >= 30 && !hasBadge('streak_30')) {
    earnedBadges.push(BADGES.find(b => b.id === 'streak_30'));
  }
  
  // Perfect score
  if (measurement.comfortRating === 10 && !hasBadge('perfect_10')) {
    earnedBadges.push(BADGES.find(b => b.id === 'perfect_10'));
  }
  
  return earnedBadges;
}

// Format vibrations display (1500 -> "1.5K")
export function formatVibrations(vibrations) {
  if (vibrations >= 1000000) return `${(vibrations / 1000000).toFixed(1)}M`;
  if (vibrations >= 1000) return `${(vibrations / 1000).toFixed(1)}K`;
  return vibrations.toString();
}

// Create confetti effect data for level up
export function createLevelUpConfetti(rank) {
  return {
    colors: [rank.color, '#FFD700', '#FF69B4', '#00CED1'],
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 }
  };
}
