// src/components/location/PhotoGallery.jsx
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, User } from 'lucide-react';
import Modal from '../common/Modal';
import { supabase } from '../../lib/supabase';
import { formatRelativeTime } from '../../utils';

export const PhotoGallery = ({ locationId, photos: initialPhotos = [] }) => {
  const [photos, setPhotos] = useState(initialPhotos);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (locationId && initialPhotos.length === 0) {
      loadPhotos();
    }
  }, [locationId]);

  const loadPhotos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('location_photos')
        .select('*, profiles(username, avatar_url)')
        .eq('location_id', locationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    setSelectedIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const goToNext = () => {
    setSelectedIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e) => {
    if (selectedIndex === null) return;
    
    switch (e.key) {
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
      case 'Escape':
        closeLightbox();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (selectedIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedIndex]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="aspect-square bg-slate-700 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-8 text-white/40">
        <p>No photos yet</p>
        <p className="text-sm mt-1">Be the first to add a photo!</p>
      </div>
    );
  }

  return (
    <>
      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <button
            key={photo.id}
            onClick={() => openLightbox(index)}
            className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
          >
            <img
              src={photo.photo_url}
              alt={`Photo ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <X size={24} className="text-white" />
          </button>

          {/* Navigation buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-10"
              >
                <ChevronLeft size={32} className="text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-10"
              >
                <ChevronRight size={32} className="text-white" />
              </button>
            </>
          )}

          {/* Image */}
          <div className="max-w-5xl max-h-[90vh] w-full px-16">
            <img
              src={photos[selectedIndex].photo_url}
              alt={`Photo ${selectedIndex + 1}`}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Info bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <div className="max-w-5xl mx-auto flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                {photos[selectedIndex].profiles?.avatar_url ? (
                  <img
                    src={photos[selectedIndex].profiles.avatar_url}
                    alt={photos[selectedIndex].profiles.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <User size={16} className="text-purple-400" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium">
                    {photos[selectedIndex].profiles?.username || 'Anonymous'}
                  </p>
                  <p className="text-xs text-white/60">
                    {formatRelativeTime(photos[selectedIndex].created_at)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/60">
                {selectedIndex + 1} / {photos.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoGallery;
