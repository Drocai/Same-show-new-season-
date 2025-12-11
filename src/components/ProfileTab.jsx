// src/components/ProfileTab.jsx
import React, { useState, useMemo } from 'react';
import { User, Zap, Trophy, Award, TrendingUp, Send, ChevronRight } from 'lucide-react';
import { RANKS, BADGES, getRankProgress, formatVibrations } from '../lib/resonance';

export default function ProfileTab({ user, leaderboard = [] }) {
  const [activeSection, setActiveSection] = useState('stats'); // 'stats', 'badges', 'leaderboard'
  
  // Demo user if none provided
  const currentUser = user || {
    username: 'VibeSeeker',
    vibrations: 347,
    resonance_rank: 2,
    total_measurements: 23,
    streak_days: 5,
    badges: [
      { id: 'first_vibe', earned_at: '2024-01-15' },
      { id: 'early_bird', earned_at: '2024-01-18' },
      { id: 'streak_3', earned_at: '2024-01-20' }
    ]
  };

  const rankProgress = useMemo(() => getRankProgress(currentUser.vibrations), [currentUser.vibrations]);
  const currentRank = RANKS.find(r => r.rank === currentUser.resonance_rank) || RANKS[0];
  
  const earnedBadgeIds = new Set(currentUser.badges?.map(b => b.id) || []);

  // Demo leaderboard
  const demoLeaderboard = leaderboard.length > 0 ? leaderboard : [
    { username: 'FreqMaster', vibrations: 5420, resonance_rank: 5 },
    { username: 'SoundWave', vibrations: 2180, resonance_rank: 4 },
    { username: 'VibeTribe', vibrations: 1650, resonance_rank: 4 },
    { username: currentUser.username, vibrations: currentUser.vibrations, resonance_rank: currentUser.resonance_rank, isCurrentUser: true },
    { username: 'ChillSeeker', vibrations: 289, resonance_rank: 2 },
    { username: 'QuietFinder', vibrations: 156, resonance_rank: 2 },
    { username: 'NewViber', vibrations: 45, resonance_rank: 1 },
  ].sort((a, b) => b.vibrations - a.vibrations);

  const userRankPosition = demoLeaderboard.findIndex(u => u.isCurrentUser) + 1;

  return (
    <div className="profile-tab">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="avatar-ring" style={{ borderColor: currentRank.color }}>
          <div className="avatar">
            <User size={32} />
          </div>
          <div className="rank-badge" style={{ backgroundColor: currentRank.color }}>
            {currentRank.icon}
          </div>
        </div>
        <div className="profile-info">
          <h2>{currentUser.username}</h2>
          <div className="rank-label" style={{ color: currentRank.color }}>
            {currentRank.name}
          </div>
        </div>
      </div>

      {/* Vibrations Display */}
      <div className="vibrations-card">
        <div className="vibrations-icon">
          <Zap size={24} />
        </div>
        <div className="vibrations-info">
          <div className="vibrations-count">{formatVibrations(currentUser.vibrations)}</div>
          <div className="vibrations-label">Vibrations</div>
        </div>
        {rankProgress.next && (
          <div className="next-rank-preview">
            <span>{rankProgress.toNext} to</span>
            <span style={{ color: rankProgress.next.color }}>{rankProgress.next.icon} {rankProgress.next.name}</span>
          </div>
        )}
      </div>

      {/* Rank Progress Bar */}
      <div className="rank-progress-card">
        <div className="progress-header">
          <span>Rank Progress</span>
          <span>{Math.round(rankProgress.progress)}%</span>
        </div>
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill"
            style={{ 
              width: `${rankProgress.progress}%`,
              background: `linear-gradient(90deg, ${currentRank.color}, ${rankProgress.next?.color || currentRank.color})`
            }}
          />
        </div>
        <div className="rank-markers">
          {RANKS.map((rank, i) => (
            <div 
              key={rank.rank}
              className={`rank-marker ${currentUser.resonance_rank >= rank.rank ? 'achieved' : ''}`}
              style={{ left: `${(i / (RANKS.length - 1)) * 100}%` }}
            >
              <span className="marker-icon">{rank.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{currentUser.total_measurements}</div>
          <div className="stat-label">Measurements</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-value">{currentUser.streak_days}</div>
          <div className="stat-label">Day Streak</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">#{userRankPosition}</div>
          <div className="stat-label">Ranking</div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="section-tabs">
        <button 
          className={activeSection === 'stats' ? 'active' : ''}
          onClick={() => setActiveSection('stats')}
        >
          <TrendingUp size={16} />
          Stats
        </button>
        <button 
          className={activeSection === 'badges' ? 'active' : ''}
          onClick={() => setActiveSection('badges')}
        >
          <Award size={16} />
          Badges
        </button>
        <button 
          className={activeSection === 'leaderboard' ? 'active' : ''}
          onClick={() => setActiveSection('leaderboard')}
        >
          <Trophy size={16} />
          Leaderboard
        </button>
      </div>

      {/* Section Content */}
      <div className="section-content">
        {activeSection === 'stats' && (
          <div className="stats-section">
            <div className="stat-detail">
              <span>Total Vibrations Earned</span>
              <span>{currentUser.vibrations}</span>
            </div>
            <div className="stat-detail">
              <span>Average per Measurement</span>
              <span>{currentUser.total_measurements > 0 ? Math.round(currentUser.vibrations / currentUser.total_measurements) : 0}</span>
            </div>
            <div className="stat-detail">
              <span>Best Streak</span>
              <span>{currentUser.streak_days} days</span>
            </div>
            <div className="stat-detail">
              <span>Badges Earned</span>
              <span>{currentUser.badges?.length || 0} / {BADGES.length}</span>
            </div>
          </div>
        )}

        {activeSection === 'badges' && (
          <div className="badges-grid">
            {BADGES.map(badge => {
              const isEarned = earnedBadgeIds.has(badge.id);
              return (
                <div 
                  key={badge.id}
                  className={`badge-card ${isEarned ? 'earned' : 'locked'}`}
                >
                  <div className="badge-icon">{badge.icon}</div>
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-description">{badge.description}</div>
                  {isEarned && <div className="earned-check">✓</div>}
                </div>
              );
            })}
          </div>
        )}

        {activeSection === 'leaderboard' && (
          <div className="leaderboard-list">
            {demoLeaderboard.map((player, index) => {
              const rank = RANKS.find(r => r.rank === player.resonance_rank) || RANKS[0];
              return (
                <div 
                  key={player.username}
                  className={`leaderboard-row ${player.isCurrentUser ? 'current-user' : ''}`}
                >
                  <div className="leaderboard-position">
                    {index < 3 ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                  </div>
                  <div className="leaderboard-user">
                    <span className="leaderboard-name">{player.username}</span>
                    <span className="leaderboard-rank" style={{ color: rank.color }}>
                      {rank.icon} {rank.name}
                    </span>
                  </div>
                  <div className="leaderboard-vibrations">
                    <Zap size={14} />
                    {formatVibrations(player.vibrations)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .profile-tab {
          padding: 1rem;
          overflow-y: auto;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .avatar-ring {
          position: relative;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: 3px solid;
          padding: 3px;
        }

        .avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.7);
        }

        .rank-badge {
          position: absolute;
          bottom: -4px;
          right: -4px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          border: 2px solid #0F172A;
        }

        .profile-info h2 {
          margin: 0;
          font-size: 1.4rem;
        }

        .rank-label {
          font-size: 0.9rem;
          font-weight: 600;
        }

        .vibrations-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%);
          border-radius: 16px;
          margin-bottom: 1rem;
        }

        .vibrations-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(139, 92, 246, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #8B5CF6;
        }

        .vibrations-count {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #8B5CF6, #EC4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .vibrations-label {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .next-rank-preview {
          margin-left: auto;
          text-align: right;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .next-rank-preview span:last-child {
          display: block;
          font-weight: 600;
        }

        .rank-progress-card {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
        }

        .progress-bar-container {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .rank-markers {
          position: relative;
          height: 24px;
        }

        .rank-marker {
          position: absolute;
          transform: translateX(-50%);
          opacity: 0.4;
          transition: opacity 0.3s;
        }

        .rank-marker.achieved {
          opacity: 1;
        }

        .marker-icon {
          font-size: 1.1rem;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
        }

        .stat-icon {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .stat-label {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .section-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .section-tabs button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .section-tabs button.active {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.3);
          color: white;
        }

        .section-content {
          min-height: 200px;
        }

        .stats-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .stat-detail {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 10px;
        }

        .stat-detail span:first-child {
          color: rgba(255, 255, 255, 0.6);
        }

        .stat-detail span:last-child {
          font-weight: 600;
        }

        .badges-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .badge-card {
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
          transition: all 0.2s;
        }

        .badge-card.locked {
          opacity: 0.4;
        }

        .badge-card.earned {
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.2);
        }

        .badge-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .badge-name {
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .badge-description {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .earned-check {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10B981;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .leaderboard-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          transition: all 0.2s;
        }

        .leaderboard-row.current-user {
          background: rgba(139, 92, 246, 0.15);
          border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .leaderboard-position {
          width: 32px;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .leaderboard-user {
          flex: 1;
        }

        .leaderboard-name {
          display: block;
          font-weight: 600;
        }

        .leaderboard-rank {
          font-size: 0.75rem;
        }

        .leaderboard-vibrations {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #8B5CF6;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
