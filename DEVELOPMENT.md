# Development Guide

Complete guide for developing and contributing to Vibe Rated.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- Code editor (VS Code recommended)
- Modern browser (Chrome/Firefox/Safari)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/Drocai/Same-show-new-season-.git
cd Same-show-new-season-

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
```

### Development Server

```bash
# Start dev server
npm run dev

# Open http://localhost:3000
# Hot reload enabled - changes reflect immediately
```

## Project Architecture

### Technology Stack

- **Frontend**: React 18 with Hooks
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 3
- **State Management**: React Context API
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Maps**: React Leaflet + OpenStreetMap
- **Charts**: Recharts
- **Icons**: Lucide React
- **PWA**: Vite PWA Plugin with Workbox

### Directory Structure

```
src/
├── components/
│   ├── common/           # Reusable UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Input.jsx
│   │   ├── Loading.jsx
│   │   ├── Toast.jsx
│   │   └── ErrorBoundary.jsx
│   ├── auth/            # Authentication components
│   ├── measurement/     # Measurement components
│   ├── location/        # Location components
│   ├── profile/         # Profile components
│   ├── MeasureTab.jsx   # Main measurement UI
│   ├── ExploreTab.jsx   # Map and location discovery
│   ├── ProfileTab.jsx   # User stats and leaderboard
│   └── LearnTab.jsx     # Educational content
├── lib/
│   ├── vibeAnalyzer.js  # Core measurement engine
│   ├── resonance.js     # Gamification logic
│   └── supabase.js      # Supabase client
├── hooks/
│   └── index.js         # Custom React hooks
├── contexts/
│   └── AuthContext.jsx  # Authentication context
├── utils/
│   └── index.js         # Utility functions
├── constants/
│   └── index.js         # App constants
├── styles/
│   └── global.css       # Global styles
├── App.jsx              # Main app component
└── main.jsx             # Entry point
```

## Core Concepts

### Vibe Analyzer

The heart of the app - measures environmental factors:

```javascript
import { vibeAnalyzer } from './lib/vibeAnalyzer';

// Initialize sensors (optional)
await vibeAnalyzer.initializeSensors();

// Start 17-second measurement
vibeAnalyzer.onProgress = ({ progress, timeRemaining, currentSample }) => {
  console.log(`${progress}% complete, ${timeRemaining}s remaining`);
};

vibeAnalyzer.onComplete = (result) => {
  console.log('Measurement complete:', result);
  // result contains: soundDb, lightLux, stability, vibeScore, etc.
};

await vibeAnalyzer.startMeasurement({ useSensors: true });
```

### Resonance System

Gamification layer for user engagement:

```javascript
import { calculateVibrations, getRank, getRankProgress } from './lib/resonance';

// Calculate vibrations earned
const vibrations = calculateVibrations({
  vibeScore: 85,
  isFirstToday: true,
  isNewLocation: false
}, streakDays);

// Get user's rank
const rank = getRank(totalVibrations);

// Get progress to next rank
const progress = getRankProgress(totalVibrations);
```

### Authentication

Using Supabase Auth with React Context:

```javascript
import { useAuth } from './contexts/AuthContext';

function Component() {
  const { user, profile, signIn, signOut, loading } = useAuth();
  
  if (loading) return <Loading />;
  
  return (
    <div>
      {user ? (
        <button onClick={signOut}>Sign Out</button>
      ) : (
        <button onClick={() => signIn(email, password)}>Sign In</button>
      )}
    </div>
  );
}
```

## Development Workflow

### Creating Components

Use functional components with hooks:

```javascript
// src/components/common/Example.jsx
import React, { useState, useEffect } from 'react';

export const Example = ({ title, onAction }) => {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, []);
  
  return (
    <div className="p-4 bg-slate-800 rounded-xl">
      <h2>{title}</h2>
      <button onClick={onAction}>Action</button>
    </div>
  );
};

export default Example;
```

### Using Custom Hooks

```javascript
import { useLocalStorage, useDebounce, useGeolocation } from './hooks';

function Component() {
  const [value, setValue] = useLocalStorage('key', 'default');
  const debouncedValue = useDebounce(value, 500);
  const { location, error, loading } = useGeolocation();
  
  // Use hooks...
}
```

### Styling with Tailwind

```javascript
// Utility-first approach
<div className="flex items-center gap-4 p-6 bg-slate-800 rounded-xl">
  <span className="text-lg font-bold text-white">Title</span>
  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg">
    Click Me
  </button>
</div>

// Custom classes in global.css
<div className="custom-card">
  Content
</div>
```

### State Management

Use Context for global state:

```javascript
// Create context
import { createContext, useContext, useState } from 'react';

const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [state, setState] = useState(null);
  
  return (
    <MyContext.Provider value={{ state, setState }}>
      {children}
    </MyContext.Provider>
  );
};

export const useMyContext = () => useContext(MyContext);
```

## Database Operations

### Querying Data

```javascript
import { supabase } from './lib/supabase';

// Get locations
const { data, error } = await supabase
  .from('locations')
  .select('*')
  .eq('location_type', 'cafe')
  .order('avg_vibe_score', { ascending: false })
  .limit(10);

// Insert measurement
const { data, error } = await supabase
  .from('measurements')
  .insert({
    user_id: userId,
    location_id: locationId,
    sound_db: 45.5,
    light_lux: 350,
    stability_score: 85,
    vibe_score: 78
  });
```

### Real-time Subscriptions

```javascript
useEffect(() => {
  const subscription = supabase
    .channel('measurements')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'measurements'
    }, (payload) => {
      console.log('New measurement:', payload.new);
    })
    .subscribe();
    
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Testing

### Manual Testing

```bash
# Test in different browsers
npm run dev

# Test production build
npm run build
npm run preview

# Test PWA installation
# Open in mobile browser and try "Add to Home Screen"
```

### Browser Testing

Test in:
- Chrome (desktop & mobile)
- Firefox
- Safari (iOS)
- Edge

### Sensor Testing

```javascript
// Test sensor availability
console.log('Microphone:', 'mediaDevices' in navigator);
console.log('Light sensor:', 'AmbientLightSensor' in window);
console.log('Accelerometer:', 'Accelerometer' in window);
```

## Code Quality

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Formatting

```bash
# Format code with Prettier
npm run format
```

### Best Practices

1. **Component Structure**
   - Keep components small and focused
   - Extract reusable logic to hooks
   - Use prop-types or TypeScript for type safety

2. **Performance**
   - Use React.memo for expensive components
   - Implement lazy loading for routes
   - Optimize images and assets
   - Use proper key props in lists

3. **Accessibility**
   - Use semantic HTML
   - Add ARIA labels where needed
   - Ensure keyboard navigation works
   - Test with screen readers

4. **Security**
   - Never expose API keys in client code
   - Validate all user inputs
   - Use Supabase RLS policies
   - Sanitize data before rendering

## Debugging

### Browser DevTools

```javascript
// Add debug logs
console.log('State:', state);
console.table(data);

// React DevTools
// Install React DevTools extension

// Network tab
// Monitor API calls and responses
```

### Common Issues

**Hot reload not working**
```bash
# Restart dev server
npm run dev
```

**Build fails**
```bash
# Clear cache
rm -rf node_modules dist .vite
npm install
npm run build
```

**Supabase connection issues**
```javascript
// Check environment variables
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);

// Test connection
const { data, error } = await supabase.from('profiles').select('count');
console.log('Connection test:', { data, error });
```

## Performance Optimization

### Code Splitting

```javascript
// Lazy load components
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### Memoization

```javascript
import { useMemo, useCallback } from 'react';

function Component({ data }) {
  // Memoize expensive calculations
  const processedData = useMemo(() => {
    return data.map(item => /* expensive operation */);
  }, [data]);
  
  // Memoize callbacks
  const handleClick = useCallback(() => {
    // Handle click
  }, []);
  
  return <div onClick={handleClick}>{processedData}</div>;
}
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
# Check dist/assets/ for file sizes

# Use bundle analyzer (optional)
npm install -D rollup-plugin-visualizer
```

## Git Workflow

### Branching Strategy

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push to GitHub
git push origin feature/new-feature

# Create pull request on GitHub
```

### Commit Messages

Follow conventional commits:

```
feat: Add new measurement chart
fix: Resolve sensor permission issue
docs: Update README with deployment info
style: Format code with Prettier
refactor: Simplify vibe calculation logic
test: Add unit tests for resonance system
chore: Update dependencies
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Pull Request Guidelines

- Clear description of changes
- Reference related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Follow code style guidelines

## Resources

### Documentation
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Docs](https://supabase.com/docs)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [VS Code](https://code.visualstudio.com)
- [Postman](https://www.postman.com) - API testing

### Community
- GitHub Discussions
- Discord (if available)
- Stack Overflow

---

**Happy Coding! 💻**
