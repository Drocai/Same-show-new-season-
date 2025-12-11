// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Activity, Compass, User, BookOpen, Zap } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useGeolocation, useLocalStorage } from './hooks';
import MeasureTab from './components/MeasureTab';
import ExploreTab from './components/ExploreTab';
import ProfileTab from './components/ProfileTab';
import LearnTab from './components/LearnTab';
import Toast from './components/common/Toast';
import Loading from './components/common/Loading';

const TABS = [
  { id: 'measure', label: 'Measure', icon: Activity },
  { id: 'explore', label: 'Explore', icon: Compass },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'learn', label: 'Learn', icon: BookOpen },
];

export default function App() {
  const { user, profile, loading: authLoading, useDemoMode } = useAuth();
  const [activeTab, setActiveTab] = useLocalStorage('vibe_rated_active_tab', 'measure');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [recentMeasurement, setRecentMeasurement] = useState(null);
  const [toast, setToast] = useState(null);
  const { location: userGeoLocation } = useGeolocation();

  // Initialize demo mode if no user
  useEffect(() => {
    if (!authLoading && !user) {
      useDemoMode();
    }
  }, [authLoading, user, useDemoMode]);

  const handleMeasurementComplete = (measurement) => {
    setRecentMeasurement(measurement);
    showToast(`Measurement complete! +${measurement.vibrationsEarned} vibrations`, 'success');
  };

  const handleSelectLocation = (location) => {
    setCurrentLocation(location);
    setActiveTab('measure');
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  if (authLoading) {
    return <Loading fullScreen text="Loading Vibe Rated..." />;
  }

  return (
    <div className="flex flex-col h-full max-w-[480px] mx-auto bg-slate-900 relative">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-4 bg-slate-900/95 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg">Vibe Rated</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 rounded-full">
          <Zap size={14} className="text-purple-400" />
          <span className="font-semibold text-sm text-purple-300">
            {profile?.vibrations || 0}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'measure' && (
          <MeasureTab
            user={profile}
            currentLocation={currentLocation}
            onMeasurementComplete={handleMeasurementComplete}
            showToast={showToast}
          />
        )}
        {activeTab === 'explore' && (
          <ExploreTab
            onSelectLocation={handleSelectLocation}
            userLocation={userGeoLocation}
            showToast={showToast}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileTab user={profile} showToast={showToast} />
        )}
        {activeTab === 'learn' && (
          <LearnTab recentMeasurement={recentMeasurement} />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 flex bg-slate-900/95 backdrop-blur-md border-t border-white/5 pb-safe">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-200
                ${isActive ? 'text-purple-400' : 'text-white/40 hover:text-white/60'}
              `}
            >
              <Icon size={22} className={isActive ? 'scale-110' : ''} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
