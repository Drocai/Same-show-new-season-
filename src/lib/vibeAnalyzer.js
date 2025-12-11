// src/lib/vibeAnalyzer.js
// The core 17-second measurement algorithm for environmental frequency analysis

// Optimal ranges for comfort (based on research)
export const OPTIMAL_RANGES = {
  sound: { min: 40, max: 60, unit: 'dB', label: 'Sound Level' },
  light: { min: 300, max: 500, unit: 'lux', label: 'Light Level' },
  stability: { min: 70, max: 100, unit: '%', label: 'Stability' }
};

// Location type presets
export const LOCATION_PRESETS = {
  cafe: { sound: { min: 45, max: 65 }, light: { min: 250, max: 450 }, stability: { min: 60, max: 85 } },
  library: { sound: { min: 30, max: 45 }, light: { min: 350, max: 550 }, stability: { min: 80, max: 95 } },
  office: { sound: { min: 40, max: 55 }, light: { min: 400, max: 600 }, stability: { min: 75, max: 90 } },
  park: { sound: { min: 50, max: 70 }, light: { min: 500, max: 2000 }, stability: { min: 50, max: 80 } },
  home: { sound: { min: 35, max: 50 }, light: { min: 200, max: 400 }, stability: { min: 85, max: 98 } }
};

class VibeAnalyzer {
  constructor() {
    this.measurementDuration = 17; // seconds - the golden duration
    this.sampleRate = 10; // samples per second
    this.samples = [];
    this.isRunning = false;
    this.onProgress = null;
    this.onComplete = null;
  }

  // Start a 17-second measurement
  async startMeasurement(options = {}) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.samples = [];
    
    const totalSamples = this.measurementDuration * this.sampleRate;
    
    for (let i = 0; i < totalSamples && this.isRunning; i++) {
      const sample = await this.takeSample(options.useSensors);
      this.samples.push(sample);
      
      const progress = ((i + 1) / totalSamples) * 100;
      const timeRemaining = Math.ceil((totalSamples - i - 1) / this.sampleRate);
      
      if (this.onProgress) {
        this.onProgress({ progress, timeRemaining, currentSample: sample });
      }
      
      await this.sleep(1000 / this.sampleRate);
    }
    
    this.isRunning = false;
    
    if (this.samples.length > 0) {
      const result = this.analyzeResults();
      if (this.onComplete) {
        this.onComplete(result);
      }
      return result;
    }
    
    return null;
  }

  stop() {
    this.isRunning = false;
  }

  // Take a single sensor sample
  async takeSample(useSensors = false) {
    if (useSensors && typeof navigator !== 'undefined') {
      return this.takeRealSample();
    }
    return this.takeSimulatedSample();
  }

  // Real sensor reading (requires permissions)
  async takeRealSample() {
    const sample = { timestamp: Date.now(), sound: 0, light: 0, motion: { x: 0, y: 0, z: 0 } };
    
    // Microphone for sound level
    try {
      if (this.audioContext && this.analyser) {
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        sample.sound = 30 + (average / 255) * 70; // Map to dB range
      }
    } catch (e) {
      sample.sound = 45 + Math.random() * 20;
    }
    
    // Ambient Light Sensor (if available)
    try {
      if (this.lightSensor) {
        sample.light = this.lightSensor.illuminance;
      } else {
        sample.light = 300 + Math.random() * 300;
      }
    } catch (e) {
      sample.light = 300 + Math.random() * 300;
    }
    
    // Accelerometer for stability
    try {
      if (this.accelerometer) {
        sample.motion = { x: this.accelerometer.x, y: this.accelerometer.y, z: this.accelerometer.z };
      }
    } catch (e) {
      sample.motion = { x: Math.random() * 0.1, y: Math.random() * 0.1, z: 9.8 + Math.random() * 0.1 };
    }
    
    return sample;
  }

  // Simulated sample for demo/testing
  takeSimulatedSample() {
    const baseSound = 50 + Math.sin(Date.now() / 1000) * 10;
    const baseLight = 400 + Math.sin(Date.now() / 2000) * 100;
    
    return {
      timestamp: Date.now(),
      sound: baseSound + (Math.random() - 0.5) * 15,
      light: baseLight + (Math.random() - 0.5) * 50,
      motion: {
        x: (Math.random() - 0.5) * 0.2,
        y: (Math.random() - 0.5) * 0.2,
        z: 9.8 + (Math.random() - 0.5) * 0.3
      }
    };
  }

  // Initialize real sensors
  async initializeSensors() {
    // Audio
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);
    } catch (e) {
      console.log('Audio sensor not available:', e.message);
    }
    
    // Light
    try {
      if ('AmbientLightSensor' in window) {
        this.lightSensor = new AmbientLightSensor();
        this.lightSensor.start();
      }
    } catch (e) {
      console.log('Light sensor not available:', e.message);
    }
    
    // Motion
    try {
      if ('Accelerometer' in window) {
        this.accelerometer = new Accelerometer({ frequency: 10 });
        this.accelerometer.start();
      }
    } catch (e) {
      console.log('Accelerometer not available:', e.message);
    }
  }

  // Analyze collected samples
  analyzeResults() {
    if (this.samples.length === 0) return null;
    
    // Calculate averages
    const avgSound = this.samples.reduce((sum, s) => sum + s.sound, 0) / this.samples.length;
    const avgLight = this.samples.reduce((sum, s) => sum + s.light, 0) / this.samples.length;
    
    // Calculate stability from motion variance
    const motionMagnitudes = this.samples.map(s => 
      Math.sqrt(s.motion.x ** 2 + s.motion.y ** 2 + (s.motion.z - 9.8) ** 2)
    );
    const avgMotion = motionMagnitudes.reduce((a, b) => a + b, 0) / motionMagnitudes.length;
    const motionVariance = motionMagnitudes.reduce((sum, m) => sum + (m - avgMotion) ** 2, 0) / motionMagnitudes.length;
    const stability = Math.max(0, 100 - (motionVariance * 100)); // Lower variance = higher stability
    
    // Calculate individual scores (0-100)
    const soundScore = this.calculateDimensionScore(avgSound, OPTIMAL_RANGES.sound);
    const lightScore = this.calculateDimensionScore(avgLight, OPTIMAL_RANGES.light);
    const stabilityScore = stability;
    
    // Calculate overall vibe score (weighted average)
    const vibeScore = (soundScore * 0.4) + (lightScore * 0.3) + (stabilityScore * 0.3);
    
    // Generate frequency chart data
    const frequencyData = this.generateFrequencyData();
    
    return {
      // Raw measurements
      soundDb: Math.round(avgSound * 10) / 10,
      lightLux: Math.round(avgLight),
      stability: Math.round(stability * 10) / 10,
      
      // Scores (0-100)
      soundScore: Math.round(soundScore),
      lightScore: Math.round(lightScore),
      stabilityScore: Math.round(stabilityScore),
      vibeScore: Math.round(vibeScore),
      
      // Comfort rating (1-10)
      comfortRating: Math.round(vibeScore / 10),
      
      // Chart data
      frequencyData,
      
      // Metadata
      duration: this.measurementDuration,
      sampleCount: this.samples.length,
      timestamp: new Date().toISOString()
    };
  }

  // Calculate how close a value is to optimal range
  calculateDimensionScore(value, range) {
    const { min, max } = range;
    const optimal = (min + max) / 2;
    const tolerance = (max - min) / 2;
    
    const distance = Math.abs(value - optimal);
    const score = Math.max(0, 100 - (distance / tolerance) * 50);
    
    return Math.min(100, score);
  }

  // Generate frequency visualization data
  generateFrequencyData() {
    const data = [];
    const chunkSize = Math.floor(this.samples.length / 17);
    
    for (let i = 0; i < 17; i++) {
      const start = i * chunkSize;
      const chunk = this.samples.slice(start, start + chunkSize);
      
      if (chunk.length > 0) {
        const avgSound = chunk.reduce((sum, s) => sum + s.sound, 0) / chunk.length;
        const avgLight = chunk.reduce((sum, s) => sum + s.light, 0) / chunk.length;
        
        data.push({
          second: i + 1,
          sound: Math.round(avgSound * 10) / 10,
          light: Math.round(avgLight / 10), // Scale for chart
          label: `${i + 1}s`
        });
      }
    }
    
    return data;
  }

  // Get rating emoji/indicator
  static getVibeIndicator(score) {
    if (score >= 90) return { emoji: '🔥', label: 'Perfect Vibe', color: '#10B981' };
    if (score >= 75) return { emoji: '✨', label: 'Great Vibe', color: '#3B82F6' };
    if (score >= 60) return { emoji: '👍', label: 'Good Vibe', color: '#8B5CF6' };
    if (score >= 40) return { emoji: '😐', label: 'Okay Vibe', color: '#F59E0B' };
    return { emoji: '💨', label: 'Rough Vibe', color: '#EF4444' };
  }

  // Compare actual vs expected for a location type
  static compareToExpected(result, locationType) {
    const preset = LOCATION_PRESETS[locationType] || LOCATION_PRESETS.cafe;
    
    return {
      sound: {
        actual: result.soundDb,
        expected: `${preset.sound.min}-${preset.sound.max}`,
        inRange: result.soundDb >= preset.sound.min && result.soundDb <= preset.sound.max
      },
      light: {
        actual: result.lightLux,
        expected: `${preset.light.min}-${preset.light.max}`,
        inRange: result.lightLux >= preset.light.min && result.lightLux <= preset.light.max
      },
      stability: {
        actual: result.stability,
        expected: `${preset.stability.min}-${preset.stability.max}`,
        inRange: result.stability >= preset.stability.min && result.stability <= preset.stability.max
      }
    };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton export
export const vibeAnalyzer = new VibeAnalyzer();
export default VibeAnalyzer;
