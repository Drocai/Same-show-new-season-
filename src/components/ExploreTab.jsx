// src/components/ExploreTab.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Search, Filter, MapPin, List, Map as MapIcon, Star } from 'lucide-react';
import { vibeAnalyzer } from '../lib/vibeAnalyzer';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons in React
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons based on vibe score
const createVibeIcon = (score) => {
  const indicator = vibeAnalyzer.constructor.getVibeIndicator(score);
  return L.divIcon({
    className: 'vibe-marker',
    html: `<div style="
      background: ${indicator.color};
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      border: 3px solid white;
    ">${indicator.emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });
};

// Map center updater component
function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Demo locations (replace with Supabase data)
const DEMO_LOCATIONS = [
  { id: '1', name: 'Downtown Library', location_type: 'library', latitude: 34.0522, longitude: -118.2437, avg_vibe_score: 89, total_ratings: 47 },
  { id: '2', name: 'Urban Brew Café', location_type: 'cafe', latitude: 34.0555, longitude: -118.2500, avg_vibe_score: 76, total_ratings: 128 },
  { id: '3', name: 'Echo Park', location_type: 'park', latitude: 34.0780, longitude: -118.2606, avg_vibe_score: 82, total_ratings: 63 },
  { id: '4', name: 'The Quiet Room', location_type: 'cafe', latitude: 34.0500, longitude: -118.2350, avg_vibe_score: 94, total_ratings: 31 },
  { id: '5', name: 'Tech Hub Cowork', location_type: 'office', latitude: 34.0600, longitude: -118.2550, avg_vibe_score: 71, total_ratings: 89 },
  { id: '6', name: 'Sunrise Roasters', location_type: 'cafe', latitude: 34.0480, longitude: -118.2420, avg_vibe_score: 68, total_ratings: 156 },
];

const LOCATION_TYPES = [
  { value: 'all', label: 'All', icon: '🌐' },
  { value: 'cafe', label: 'Cafés', icon: '☕' },
  { value: 'library', label: 'Libraries', icon: '📚' },
  { value: 'park', label: 'Parks', icon: '🌳' },
  { value: 'office', label: 'Offices', icon: '🏢' },
];

export default function ExploreTab({ locations = DEMO_LOCATIONS, onSelectLocation, userLocation }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState(null);

  const mapCenter = useMemo(() => {
    if (userLocation) return [userLocation.lat, userLocation.lng];
    if (locations.length > 0) return [locations[0].latitude, locations[0].longitude];
    return [34.0522, -118.2437]; // Default to LA
  }, [userLocation, locations]);

  const filteredLocations = useMemo(() => {
    return locations.filter(loc => {
      const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || loc.location_type === filterType;
      return matchesSearch && matchesType;
    }).sort((a, b) => b.avg_vibe_score - a.avg_vibe_score);
  }, [locations, searchQuery, filterType]);

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    if (onSelectLocation) onSelectLocation(location);
  };

  return (
    <div className="explore-tab">
      {/* Search & Filter Header */}
      <div className="explore-header">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="view-toggle">
          <button 
            className={viewMode === 'list' ? 'active' : ''} 
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
          </button>
          <button 
            className={viewMode === 'map' ? 'active' : ''} 
            onClick={() => setViewMode('map')}
          >
            <MapIcon size={18} />
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="filter-pills">
        {LOCATION_TYPES.map(type => (
          <button
            key={type.value}
            className={`filter-pill ${filterType === type.value ? 'active' : ''}`}
            onClick={() => setFilterType(type.value)}
          >
            <span>{type.icon}</span>
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="explore-content">
        {viewMode === 'list' ? (
          <div className="location-list">
            {filteredLocations.map(location => {
              const indicator = vibeAnalyzer.constructor.getVibeIndicator(location.avg_vibe_score);
              return (
                <div 
                  key={location.id} 
                  className={`location-card ${selectedLocation?.id === location.id ? 'selected' : ''}`}
                  onClick={() => handleSelectLocation(location)}
                >
                  <div className="location-score" style={{ backgroundColor: indicator.color }}>
                    {location.avg_vibe_score}
                  </div>
                  <div className="location-info">
                    <div className="location-name">{location.name}</div>
                    <div className="location-meta">
                      <span className="location-type-badge">{location.location_type}</span>
                      <span className="location-ratings">
                        <Star size={12} /> {location.total_ratings} ratings
                      </span>
                    </div>
                  </div>
                  <div className="location-indicator">
                    {indicator.emoji}
                  </div>
                </div>
              );
            })}
            
            {filteredLocations.length === 0 && (
              <div className="no-results">
                <MapPin size={48} />
                <p>No locations found</p>
                <span>Try adjusting your filters</span>
              </div>
            )}
          </div>
        ) : (
          <div className="map-container">
            <MapContainer 
              center={mapCenter} 
              zoom={13} 
              style={{ height: '100%', width: '100%', borderRadius: '16px' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <MapCenterUpdater center={mapCenter} />
              
              {filteredLocations.map(location => (
                <Marker
                  key={location.id}
                  position={[location.latitude, location.longitude]}
                  icon={createVibeIcon(location.avg_vibe_score)}
                  eventHandlers={{
                    click: () => handleSelectLocation(location)
                  }}
                >
                  <Popup>
                    <div className="map-popup">
                      <strong>{location.name}</strong>
                      <div className="popup-score">
                        Vibe Score: {location.avg_vibe_score}
                      </div>
                      <div className="popup-meta">
                        {location.total_ratings} ratings
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      {/* Selected Location Detail */}
      {selectedLocation && (
        <div className="location-detail-card">
          <div className="detail-header">
            <div>
              <h3>{selectedLocation.name}</h3>
              <span className="detail-type">{selectedLocation.location_type}</span>
            </div>
            <div 
              className="detail-score"
              style={{ backgroundColor: vibeAnalyzer.constructor.getVibeIndicator(selectedLocation.avg_vibe_score).color }}
            >
              {selectedLocation.avg_vibe_score}
            </div>
          </div>
          <div className="detail-stats">
            <div className="stat">
              <span className="stat-value">{selectedLocation.total_ratings}</span>
              <span className="stat-label">Ratings</span>
            </div>
            <div className="stat">
              <span className="stat-value">{vibeAnalyzer.constructor.getVibeIndicator(selectedLocation.avg_vibe_score).emoji}</span>
              <span className="stat-label">Vibe</span>
            </div>
          </div>
          <button className="measure-here-btn" onClick={() => onSelectLocation?.(selectedLocation)}>
            <MapPin size={16} />
            Measure Here
          </button>
        </div>
      )}

      <style>{`
        .explore-tab {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 1rem;
        }

        .explore-header {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .search-bar {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .search-bar input {
          flex: 1;
          background: none;
          border: none;
          color: white;
          font-size: 0.9rem;
          outline: none;
        }

        .search-bar input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .view-toggle {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          overflow: hidden;
        }

        .view-toggle button {
          padding: 0.75rem;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          transition: all 0.2s;
        }

        .view-toggle button.active {
          background: rgba(139, 92, 246, 0.3);
          color: white;
        }

        .filter-pills {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
          -webkit-overflow-scrolling: touch;
        }

        .filter-pill {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-pill.active {
          background: rgba(139, 92, 246, 0.3);
          border-color: #8B5CF6;
          color: white;
        }

        .explore-content {
          flex: 1;
          overflow: hidden;
          border-radius: 16px;
        }

        .location-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow-y: auto;
          max-height: 100%;
          padding-right: 0.5rem;
        }

        .location-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .location-card:hover, .location-card.selected {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(139, 92, 246, 0.3);
        }

        .location-score {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .location-info {
          flex: 1;
        }

        .location-name {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .location-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .location-type-badge {
          padding: 0.15rem 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          text-transform: capitalize;
        }

        .location-ratings {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .location-indicator {
          font-size: 1.5rem;
        }

        .no-results {
          text-align: center;
          padding: 3rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .no-results p {
          margin: 1rem 0 0.25rem;
          font-size: 1.1rem;
        }

        .map-container {
          height: 100%;
          border-radius: 16px;
          overflow: hidden;
        }

        .map-popup {
          color: #1E293B;
        }

        .map-popup strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .popup-score {
          font-weight: 600;
          color: #8B5CF6;
        }

        .popup-meta {
          font-size: 0.8rem;
          color: #64748B;
        }

        .location-detail-card {
          margin-top: 1rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
          border: 1px solid rgba(139, 92, 246, 0.2);
          border-radius: 16px;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .detail-header h3 {
          margin: 0 0 0.25rem;
          font-size: 1.1rem;
        }

        .detail-type {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          text-transform: capitalize;
        }

        .detail-score {
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-weight: 700;
        }

        .detail-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 1rem;
        }

        .stat {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .stat-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .measure-here-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .measure-here-btn:hover {
          transform: translateY(-2px);
        }

        /* Leaflet custom styles */
        .leaflet-container {
          background: #0F172A;
        }

        .vibe-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}
