// src/components/settings/SettingsModal.jsx
import React, { useState, useEffect } from 'react';
import { Settings, Vibrate, Bell, Moon, Globe, Info } from 'lucide-react';
import Modal from '../common/Modal';
import { setHapticsEnabled, hapticTest, hapticToggle } from '../../utils/haptics';
import { storage } from '../../utils';

export const SettingsModal = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    haptics: storage.get('haptics_enabled', true),
    notifications: storage.get('notifications_enabled', false),
    darkMode: storage.get('dark_mode', true),
    language: storage.get('language', 'en'),
  });

  const handleToggle = (key) => {
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));
    
    // Save to localStorage
    storage.set(`${key}_enabled`, newValue);
    
    // Special handling for haptics
    if (key === 'haptics') {
      setHapticsEnabled(newValue);
      if (newValue) {
        hapticTest(); // Test haptics when enabled
      }
    } else {
      hapticToggle();
    }
  };

  const settingsOptions = [
    {
      id: 'haptics',
      icon: Vibrate,
      title: 'Haptic Feedback',
      description: 'Feel vibrations when interacting with the app',
      enabled: settings.haptics,
      onTest: () => hapticTest(),
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      description: 'Receive notifications for vibes and achievements',
      enabled: settings.notifications,
    },
    {
      id: 'darkMode',
      icon: Moon,
      title: 'Dark Mode',
      description: 'Use dark theme (always on for now)',
      enabled: settings.darkMode,
      disabled: true, // Always on for now
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="md">
      <div className="space-y-4">
        {settingsOptions.map((option) => {
          const Icon = option.icon;
          return (
            <div
              key={option.id}
              className="flex items-start gap-4 p-4 bg-slate-800 rounded-xl border border-white/5"
            >
              {/* Icon */}
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${option.enabled ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-white/40'}
              `}>
                <Icon size={20} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold mb-1">{option.title}</h4>
                <p className="text-sm text-white/60">{option.description}</p>
                
                {/* Test button for haptics */}
                {option.id === 'haptics' && option.enabled && option.onTest && (
                  <button
                    onClick={option.onTest}
                    className="mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Test Haptics
                  </button>
                )}
              </div>

              {/* Toggle */}
              <button
                onClick={() => !option.disabled && handleToggle(option.id)}
                disabled={option.disabled}
                className={`
                  relative w-12 h-6 rounded-full transition-colors flex-shrink-0
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  ${option.enabled ? 'bg-purple-600' : 'bg-white/10'}
                `}
              >
                <div
                  className={`
                    absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform
                    ${option.enabled ? 'translate-x-6' : 'translate-x-0.5'}
                  `}
                />
              </button>
            </div>
          );
        })}

        {/* App Info */}
        <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Info size={16} />
            <span>Vibe Rated v2.0</span>
          </div>
          <p className="text-xs text-white/40 mt-2">
            Built with 💜 for the frequency-aware future
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
