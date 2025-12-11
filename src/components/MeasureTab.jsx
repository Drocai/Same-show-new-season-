// src/components/MeasureTab.jsx
import React, { useState, useCallback } from 'react';
import { Activity, MapPin, Clock, Zap } from 'lucide-react';
import { vibeAnalyzer } from '../lib/vibeAnalyzer';
import { calculateVibrations, getRank, checkLevelUp } from '../lib/resonance';

export default function MeasureTab({ user, currentLocation, onMeasurementComplete }) {
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(17);
  const [currentReading, setCurrentReading] = useState(null);
  const [result, setResult] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(null);

  const startMeasurement = useCallback(async () => {
    if (isMeasuring) return;
    
    setIsMeasuring(true);
    setProgress(0);
    setTimeRemaining(17);
    setResult(null);
    
    vibeAnalyzer.onProgress = ({ progress, timeRemaining, currentSample }) => {
      setProgress(progress);
      setTimeRemaining(timeRemaining);
      setCurrentReading({
        sound: Math.round(currentSample.sound * 10) / 10,
        light: Math.round(currentSample.light)
      });
    };
    
    vibeAnalyzer.onComplete = (analysisResult) => {
      setResult(analysisResult);
      setIsMeasuring(false);
      
      // Calculate vibrations earned
      const vibrationsEarned = calculateVibrations({
        vibeScore: analysisResult.vibeScore,
        isFirstToday: true, // TODO: check actual
        isNewLocation: !currentLocation?.id
      }, user?.streakDays || 0);
      
      // Check for level up
      const oldVibrations = user?.vibrations || 0;
      const newRank = checkLevelUp(oldVibrations, oldVibrations + vibrationsEarned);
      if (newRank) {
        setShowLevelUp(newRank);
      }
      
      if (onMeasurementComplete) {
        onMeasurementComplete({
          ...analysisResult,
          vibrationsEarned,
          locationId: currentLocation?.id
        });
      }
    };
    
    await vibeAnalyzer.startMeasurement({ useSensors: false });
  }, [isMeasuring, currentLocation, user, onMeasurementComplete]);

  const indicator = result ? vibeAnalyzer.constructor.getVibeIndicator(result.vibeScore) : null;

  return (
    <div className="measure-tab">
      {/* Location Header */}
      <div className="location-header">
        <MapPin size={18} />
        <span>{currentLocation?.name || 'Select a location'}</span>
        {currentLocation && (
          <span className="location-type">{currentLocation.location_type}</span>
        )}
      </div>

      {/* Main Measurement Area */}
      <div className="measurement-container">
        {!isMeasuring && !result && (
          <div className="start-state">
            <div className="pulse-ring">
              <div className="pulse-ring-inner">
                <Activity size={48} />
              </div>
            </div>
            <h2>Ready to Measure</h2>
            <p>Hold your device steady for 17 seconds</p>
            <button className="measure-button" onClick={startMeasurement}>
              <Zap size={20} />
              Start 17s Measurement
            </button>
          </div>
        )}

        {isMeasuring && (
          <div className="measuring-state">
            <div className="progress-ring">
              <svg viewBox="0 0 100 100">
                <circle className="progress-bg" cx="50" cy="50" r="45" />
                <circle 
                  className="progress-fill" 
                  cx="50" cy="50" r="45"
                  style={{ strokeDashoffset: 283 - (283 * progress / 100) }}
                />
              </svg>
              <div className="progress-text">
                <span className="time-remaining">{timeRemaining}s</span>
                <span className="progress-percent">{Math.round(progress)}%</span>
              </div>
            </div>
            
            {currentReading && (
              <div className="live-readings">
                <div className="reading">
                  <span className="reading-label">Sound</span>
                  <span className="reading-value">{currentReading.sound} dB</span>
                </div>
                <div className="reading">
                  <span className="reading-label">Light</span>
                  <span className="reading-value">{currentReading.light} lux</span>
                </div>
              </div>
            )}
            
            <p className="measuring-hint">Analyzing frequencies...</p>
          </div>
        )}

        {result && (
          <div className="result-state">
            <div className="vibe-score-display">
              <span className="vibe-emoji">{indicator.emoji}</span>
              <div className="vibe-score" style={{ color: indicator.color }}>
                {result.vibeScore}
              </div>
              <span className="vibe-label">{indicator.label}</span>
            </div>

            <div className="metrics-grid">
              <div className="metric">
                <div className="metric-icon sound">🔊</div>
                <div className="metric-value">{result.soundDb} dB</div>
                <div className="metric-label">Sound</div>
                <div className="metric-score">{result.soundScore}/100</div>
              </div>
              <div className="metric">
                <div className="metric-icon light">💡</div>
                <div className="metric-value">{result.lightLux} lux</div>
                <div className="metric-label">Light</div>
                <div className="metric-score">{result.lightScore}/100</div>
              </div>
              <div className="metric">
                <div className="metric-icon stability">⚖️</div>
                <div className="metric-value">{result.stability}%</div>
                <div className="metric-label">Stability</div>
                <div className="metric-score">{result.stabilityScore}/100</div>
              </div>
            </div>

            <div className="comfort-rating">
              <span>Comfort Rating</span>
              <div className="comfort-dots">
                {[...Array(10)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`comfort-dot ${i < result.comfortRating ? 'active' : ''}`}
                    style={{ 
                      backgroundColor: i < result.comfortRating ? indicator.color : 'transparent'
                    }}
                  />
                ))}
              </div>
              <span className="comfort-value">{result.comfortRating}/10</span>
            </div>

            <button className="measure-button secondary" onClick={startMeasurement}>
              <Clock size={16} />
              Measure Again
            </button>
          </div>
        )}
      </div>

      {/* Level Up Modal */}
      {showLevelUp && (
        <div className="modal-overlay" onClick={() => setShowLevelUp(null)}>
          <div className="level-up-modal" onClick={e => e.stopPropagation()}>
            <div className="level-up-icon" style={{ color: showLevelUp.color }}>
              {showLevelUp.icon}
            </div>
            <h2>Resonance Boost!</h2>
            <p>You've reached</p>
            <div className="new-rank" style={{ color: showLevelUp.color }}>
              Rank {showLevelUp.rank}: {showLevelUp.name}
            </div>
            <p className="rank-description">{showLevelUp.description}</p>
            <button onClick={() => setShowLevelUp(null)}>Continue</button>
          </div>
        </div>
      )}

      <style>{`
        .measure-tab {
          padding: 1rem;
          min-height: 100%;
        }

        .location-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .location-type {
          margin-left: auto;
          padding: 0.25rem 0.75rem;
          background: rgba(139, 92, 246, 0.3);
          border-radius: 20px;
          font-size: 0.75rem;
          text-transform: capitalize;
        }

        .measurement-container {
          background: linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
          border-radius: 24px;
          padding: 2rem;
          min-height: 400px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .start-state {
          text-align: center;
        }

        .pulse-ring {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          animation: pulse 2s infinite;
        }

        .pulse-ring-inner {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: rgba(139, 92, 246, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8B5CF6;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }

        .start-state h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .start-state p {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 2rem;
        }

        .measure-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
          border: none;
          border-radius: 50px;
          color: white;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .measure-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
        }

        .measure-button.secondary {
          background: rgba(255, 255, 255, 0.1);
          margin-top: 1.5rem;
        }

        .measuring-state {
          text-align: center;
        }

        .progress-ring {
          width: 180px;
          height: 180px;
          position: relative;
          margin-bottom: 1.5rem;
        }

        .progress-ring svg {
          transform: rotate(-90deg);
        }

        .progress-bg {
          fill: none;
          stroke: rgba(255, 255, 255, 0.1);
          stroke-width: 8;
        }

        .progress-fill {
          fill: none;
          stroke: url(#gradient);
          stroke: #8B5CF6;
          stroke-width: 8;
          stroke-linecap: round;
          stroke-dasharray: 283;
          transition: stroke-dashoffset 0.1s;
        }

        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .time-remaining {
          display: block;
          font-size: 2.5rem;
          font-weight: 700;
          color: #8B5CF6;
        }

        .progress-percent {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .live-readings {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;
        }

        .reading {
          text-align: center;
        }

        .reading-label {
          display: block;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.25rem;
        }

        .reading-value {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .measuring-hint {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.9rem;
        }

        .result-state {
          width: 100%;
          text-align: center;
        }

        .vibe-score-display {
          margin-bottom: 2rem;
        }

        .vibe-emoji {
          font-size: 3rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .vibe-score {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1;
        }

        .vibe-label {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .metric {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 1rem;
        }

        .metric-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .metric-value {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .metric-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.25rem;
        }

        .metric-score {
          font-size: 0.8rem;
          color: #8B5CF6;
        }

        .comfort-rating {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
        }

        .comfort-dots {
          display: flex;
          gap: 0.25rem;
        }

        .comfort-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s;
        }

        .comfort-dot.active {
          border-color: transparent;
        }

        .comfort-value {
          font-weight: 600;
        }

        /* Level Up Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.3s;
        }

        .level-up-modal {
          background: linear-gradient(180deg, #1E293B 0%, #0F172A 100%);
          border-radius: 24px;
          padding: 2.5rem;
          text-align: center;
          max-width: 320px;
          animation: scaleIn 0.3s;
        }

        .level-up-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          animation: bounce 0.5s;
        }

        .level-up-modal h2 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .new-rank {
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0.5rem 0;
        }

        .rank-description {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
        }

        .level-up-modal button {
          padding: 0.75rem 2rem;
          background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
          border: none;
          border-radius: 50px;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
