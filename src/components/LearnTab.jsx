// src/components/LearnTab.jsx
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { BookOpen, Lightbulb, Volume2, Waves, ChevronRight, Play, CheckCircle } from 'lucide-react';

const DEMO_FREQUENCY_DATA = [
  { second: 1, sound: 52, light: 42, label: '1s' },
  { second: 2, sound: 48, light: 45, label: '2s' },
  { second: 3, sound: 55, light: 43, label: '3s' },
  { second: 4, sound: 51, light: 44, label: '4s' },
  { second: 5, sound: 49, light: 46, label: '5s' },
  { second: 6, sound: 53, light: 45, label: '6s' },
  { second: 7, sound: 50, light: 47, label: '7s' },
  { second: 8, sound: 54, light: 44, label: '8s' },
  { second: 9, sound: 47, light: 48, label: '9s' },
  { second: 10, sound: 52, light: 46, label: '10s' },
  { second: 11, sound: 49, light: 45, label: '11s' },
  { second: 12, sound: 51, light: 47, label: '12s' },
  { second: 13, sound: 53, light: 44, label: '13s' },
  { second: 14, sound: 48, light: 46, label: '14s' },
  { second: 15, sound: 50, light: 45, label: '15s' },
  { second: 16, sound: 52, light: 47, label: '16s' },
  { second: 17, sound: 49, light: 46, label: '17s' },
];

const LESSONS = [
  {
    id: 'why-17',
    title: 'Why 17 Seconds?',
    icon: '⏱️',
    duration: '3 min',
    content: `The 17-second measurement window isn't arbitrary—it's based on research into acoustic metamaterials and human perception cycles.

**The Science:**
- Human brain requires ~15 seconds to fully process and adapt to environmental sounds
- Light perception stabilizes after ~12 seconds of consistent exposure
- Motion/stability patterns need ~10-17 seconds to show meaningful variance

**Metamaterial Connection:**
Acoustic metamaterials—engineered structures that manipulate sound waves—often operate on similar timescales. The resonant frequencies of these materials align with our 17-second window, making measurements more accurate.

**Practical Benefit:**
17 seconds is long enough to capture meaningful data but short enough to remain convenient for regular use.`
  },
  {
    id: 'sound-comfort',
    title: 'Sound & Comfort',
    icon: '🔊',
    duration: '4 min',
    content: `Sound levels dramatically impact our comfort, productivity, and stress levels—but the relationship isn't as simple as "quieter is better."

**The Goldilocks Zone:**
- **Below 40 dB**: Too quiet—heightens anxiety, makes every small noise jarring
- **40-60 dB**: Optimal for focus—provides "acoustic masking" that helps concentration
- **60-75 dB**: Social zone—good for conversation, creativity
- **Above 75 dB**: Stressful—triggers fight-or-flight response over time

**Why Cafés Work:**
The consistent hum of a busy café (typically 55-70 dB) provides:
1. White noise effect that masks distracting sounds
2. Social presence that reduces isolation anxiety
3. Variable enough to not become monotonous

**Your Vibe Score:**
We measure not just volume but consistency. Sudden spikes are worse than steady levels.`
  },
  {
    id: 'light-science',
    title: 'The Light Factor',
    icon: '💡',
    duration: '3 min',
    content: `Light affects everything from your circadian rhythm to your ability to focus. Here's what the numbers mean:

**Lux Ranges:**
- **0-50 lux**: Dim (twilight, candlelight)
- **50-200 lux**: Low indoor lighting
- **200-500 lux**: Standard office/home lighting
- **500-1000 lux**: Bright indoor, overcast outdoor
- **1000+ lux**: Direct sunlight

**For Focus Work:**
Research shows 300-500 lux is optimal for most cognitive tasks. Too dim causes eye strain and drowsiness; too bright causes fatigue.

**Color Temperature Matters Too:**
While Vibe Rated measures intensity, warmer light (2700K) promotes relaxation while cooler light (5000K+) enhances alertness.

**Pro Tip:**
Natural light sources score higher in our algorithm because they provide better color rendering and reduce eye strain.`
  },
  {
    id: 'stability-matters',
    title: 'Why Stability Matters',
    icon: '⚖️',
    duration: '2 min',
    content: `The stability score measures environmental consistency—and it's more important than you might think.

**What We Measure:**
Using your device's accelerometer, we detect:
- Vibrations from traffic, HVAC, footsteps
- Table wobble and structural movement
- Overall environmental "restlessness"

**Why It Matters:**
Subtle vibrations that you don't consciously notice still affect:
- Your ability to maintain focus
- Physical comfort and tension levels
- Overall sense of safety and calm

**High Stability Spots:**
- Libraries (typically 85-95% stability)
- Ground-floor cafés on quiet streets
- Dedicated coworking spaces with good furniture

**Low Stability Spots:**
- Coffee shops near busy streets
- Upper floors of older buildings
- Spaces near mechanical equipment`
  },
  {
    id: 'resonance-explained',
    title: 'Resonance & Vibrations',
    icon: '⚡',
    duration: '2 min',
    content: `Your Vibrations aren't just points—they represent your contribution to the collective frequency map.

**The Philosophy:**
Every space has a frequency. When you measure, you're adding to our understanding of how environments affect people. More data = better recommendations for everyone.

**Earning Vibrations:**
- Base measurement: 10 vibrations
- High vibe score (80+): +5 bonus
- Perfect score (90+): +10 bonus
- First measurement of day: +5
- New location: +15
- Streak multiplier: up to 2x

**Rank Progression:**
As you accumulate vibrations, you ascend through Resonance Ranks:
1. **Listener** (0+): Learning the vibes
2. **Sensor** (100+): Developing awareness
3. **Resonator** (500+): In tune with spaces
4. **Harmonizer** (1500+): Creating balance
5. **Frequency Master** (5000+): Environmental expert`
  }
];

export default function LearnTab({ recentMeasurement }) {
  const [expandedLesson, setExpandedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  
  const chartData = recentMeasurement?.frequencyData || DEMO_FREQUENCY_DATA;

  const toggleLesson = (lessonId) => {
    setExpandedLesson(expandedLesson === lessonId ? null : lessonId);
  };

  const markComplete = (lessonId) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
  };

  return (
    <div className="learn-tab">
      {/* 17-Second Visualization */}
      <div className="visualization-card">
        <div className="viz-header">
          <Waves size={20} />
          <h3>The 17-Second Window</h3>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
              <defs>
                <linearGradient id="soundGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="lightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="label" 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Area 
                type="monotone" 
                dataKey="sound" 
                fill="url(#soundGradient)" 
                stroke="#8B5CF6"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="light" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#8B5CF6' }}></span>
            Sound (dB)
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: '#F59E0B' }}></span>
            Light (scaled)
          </div>
        </div>
      </div>

      {/* Key Insight */}
      <div className="insight-card">
        <Lightbulb size={20} />
        <div>
          <strong>Did you know?</strong>
          <p>Acoustic metamaterials—engineered structures that manipulate sound waves—inspired our 17-second measurement window. These materials resonate at frequencies that align with human perception cycles.</p>
        </div>
      </div>

      {/* Lessons */}
      <div className="lessons-section">
        <h3>Learn the Science</h3>
        <div className="lessons-list">
          {LESSONS.map(lesson => (
            <div 
              key={lesson.id}
              className={`lesson-card ${expandedLesson === lesson.id ? 'expanded' : ''} ${completedLessons.has(lesson.id) ? 'completed' : ''}`}
            >
              <div className="lesson-header" onClick={() => toggleLesson(lesson.id)}>
                <div className="lesson-icon">{lesson.icon}</div>
                <div className="lesson-info">
                  <div className="lesson-title">{lesson.title}</div>
                  <div className="lesson-duration">{lesson.duration} read</div>
                </div>
                {completedLessons.has(lesson.id) ? (
                  <CheckCircle size={20} className="complete-icon" />
                ) : (
                  <ChevronRight size={20} className={`chevron ${expandedLesson === lesson.id ? 'rotated' : ''}`} />
                )}
              </div>
              
              {expandedLesson === lesson.id && (
                <div className="lesson-content">
                  {lesson.content.split('\n\n').map((paragraph, i) => {
                    if (paragraph.startsWith('**') && paragraph.includes(':**')) {
                      const [title, ...rest] = paragraph.split(':**');
                      return (
                        <div key={i} className="content-section">
                          <strong>{title.replace(/\*\*/g, '')}:</strong>
                          <p>{rest.join(':')}</p>
                        </div>
                      );
                    }
                    if (paragraph.startsWith('- ')) {
                      return (
                        <ul key={i}>
                          {paragraph.split('\n').map((item, j) => (
                            <li key={j}>{item.replace('- ', '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    return <p key={i}>{paragraph}</p>;
                  })}
                  
                  {!completedLessons.has(lesson.id) && (
                    <button 
                      className="mark-complete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        markComplete(lesson.id);
                      }}
                    >
                      <CheckCircle size={16} />
                      Mark as Complete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="progress-card">
        <div className="progress-info">
          <BookOpen size={18} />
          <span>{completedLessons.size} / {LESSONS.length} lessons completed</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(completedLessons.size / LESSONS.length) * 100}%` }}
          />
        </div>
      </div>

      <style>{`
        .learn-tab {
          padding: 1rem;
          overflow-y: auto;
        }

        .visualization-card {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }

        .viz-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .viz-header h3 {
          margin: 0;
          font-size: 1rem;
        }

        .chart-container {
          margin: 0 -0.5rem;
        }

        .chart-legend {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-top: 0.5rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .insight-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .insight-card svg {
          color: #F59E0B;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .insight-card strong {
          display: block;
          margin-bottom: 0.25rem;
          color: #F59E0B;
        }

        .insight-card p {
          margin: 0;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
        }

        .lessons-section h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .lessons-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .lesson-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s;
        }

        .lesson-card.expanded {
          border-color: rgba(139, 92, 246, 0.3);
        }

        .lesson-card.completed {
          opacity: 0.7;
        }

        .lesson-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          cursor: pointer;
        }

        .lesson-icon {
          font-size: 1.5rem;
        }

        .lesson-info {
          flex: 1;
        }

        .lesson-title {
          font-weight: 600;
          margin-bottom: 0.15rem;
        }

        .lesson-duration {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .chevron {
          color: rgba(255, 255, 255, 0.4);
          transition: transform 0.3s;
        }

        .chevron.rotated {
          transform: rotate(90deg);
        }

        .complete-icon {
          color: #10B981;
        }

        .lesson-content {
          padding: 0 1rem 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          animation: slideDown 0.3s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .lesson-content p {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0.75rem 0;
        }

        .lesson-content strong {
          color: rgba(255, 255, 255, 0.9);
        }

        .lesson-content ul {
          margin: 0.5rem 0;
          padding-left: 1.25rem;
        }

        .lesson-content li {
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 0.25rem;
        }

        .content-section {
          margin: 1rem 0;
        }

        .mark-complete-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          color: #10B981;
          font-size: 0.85rem;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.2s;
        }

        .mark-complete-btn:hover {
          background: rgba(16, 185, 129, 0.3);
        }

        .progress-card {
          margin-top: 1.5rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
        }

        .progress-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.75rem;
        }

        .progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8B5CF6, #EC4899);
          border-radius: 3px;
          transition: width 0.5s ease;
        }
      `}</style>
    </div>
  );
}
