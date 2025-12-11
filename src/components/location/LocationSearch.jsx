// src/components/location/LocationSearch.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, Loader } from 'lucide-react';
import { useDebounce, useClickOutside } from '../../hooks';
import { supabase } from '../../lib/supabase';

export const LocationSearch = ({ onSelect, placeholder = 'Search locations...', className = '' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  useClickOutside(searchRef, () => setShowResults(false));

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    searchLocations(debouncedQuery);
  }, [debouncedQuery]);

  const searchLocations = async (searchQuery) => {
    setLoading(true);
    try {
      // Search in database
      const { data: dbResults, error } = await supabase
        .from('locations')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
        .order('total_ratings', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Also search using Nominatim (OpenStreetMap) for new locations
      const nominatimResults = await searchNominatim(searchQuery);

      // Combine and deduplicate results
      const combined = [
        ...(dbResults || []).map(loc => ({ ...loc, source: 'database' })),
        ...nominatimResults.map(loc => ({ ...loc, source: 'nominatim' }))
      ];

      setResults(combined);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const searchNominatim = async (searchQuery) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();

      return data.map(item => ({
        id: `nominatim-${item.place_id}`,
        name: item.display_name.split(',')[0],
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        location_type: guessLocationType(item.type),
        source: 'nominatim'
      }));
    } catch (error) {
      console.error('Nominatim search error:', error);
      return [];
    }
  };

  const guessLocationType = (osmType) => {
    const typeMap = {
      cafe: 'cafe',
      restaurant: 'restaurant',
      library: 'library',
      park: 'park',
      office: 'office',
      building: 'office',
      house: 'home',
    };
    return typeMap[osmType] || 'other';
  };

  const handleSelect = (location) => {
    setQuery(location.name);
    setShowResults(false);
    setSelectedIndex(-1);
    onSelect(location);
  };

  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const getLocationIcon = (type) => {
    const icons = {
      cafe: '☕',
      library: '📚',
      park: '🌳',
      office: '🏢',
      home: '🏠',
      coworking: '🤝',
      restaurant: '🍽️',
      other: '📍'
    };
    return icons[type] || '📍';
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-slate-800 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
        />
        {loading && (
          <Loader className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 animate-spin" size={20} />
        )}
        {!loading && query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl max-h-96 overflow-y-auto">
          {results.map((location, index) => (
            <button
              key={location.id}
              onClick={() => handleSelect(location)}
              className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-700 transition-colors text-left ${
                index === selectedIndex ? 'bg-slate-700' : ''
              } ${index !== 0 ? 'border-t border-white/5' : ''}`}
            >
              {/* Icon */}
              <span className="text-2xl flex-shrink-0 mt-0.5">
                {getLocationIcon(location.location_type)}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white truncate">{location.name}</h4>
                  {location.source === 'database' && location.avg_vibe_score && (
                    <span className="flex-shrink-0 px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                      {Math.round(location.avg_vibe_score)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/60 truncate">{location.address || location.city || 'No address'}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-white/40 capitalize">{location.location_type}</span>
                  {location.source === 'database' && location.total_ratings > 0 && (
                    <span className="text-xs text-white/40">{location.total_ratings} ratings</span>
                  )}
                  {location.source === 'nominatim' && (
                    <span className="text-xs text-purple-400">New location</span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <MapPin className="flex-shrink-0 text-white/40" size={16} />
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {showResults && query.length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl p-4 text-center">
          <p className="text-white/60">No locations found</p>
          <p className="text-sm text-white/40 mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
