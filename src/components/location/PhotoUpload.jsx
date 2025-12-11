// src/components/location/PhotoUpload.jsx
import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader, Image as ImageIcon } from 'lucide-react';
import Button from '../common/Button';
import { supabase } from '../../lib/supabase';
import { hapticFeedback } from '../../utils';

export const PhotoUpload = ({ locationId, onUploadComplete, maxPhotos = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    await uploadPhoto(file);
  };

  const uploadPhoto = async (file) => {
    setUploading(true);
    hapticFeedback('light');

    try {
      // Compress and resize image
      const compressedFile = await compressImage(file);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${locationId}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('location-photos')
        .upload(fileName, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('location-photos')
        .getPublicUrl(fileName);

      // Save photo reference to database
      const { data: photoData, error: dbError } = await supabase
        .from('location_photos')
        .insert({
          location_id: locationId,
          photo_url: publicUrl,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setPhotos(prev => [...prev, photoData]);
      hapticFeedback('success');
      
      if (onUploadComplete) {
        onUploadComplete(photoData);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photo. Please try again.');
      hapticFeedback('error');
    } finally {
      setUploading(false);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Calculate new dimensions (max 1200px)
          let width = img.width;
          let height = img.height;
          const maxSize = 1200;

          if (width > height && width > maxSize) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width / height) * maxSize;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            },
            'image/jpeg',
            0.8
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  const canUploadMore = photos.length < maxPhotos;

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Preview */}
      {preview && (
        <div className="relative rounded-xl overflow-hidden">
          <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center">
                <Loader className="animate-spin mx-auto mb-2 text-white" size={32} />
                <p className="text-white text-sm">Uploading...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload buttons */}
      {canUploadMore && !uploading && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            onClick={handleCameraCapture}
            leftIcon={<Camera size={18} />}
            disabled={uploading}
          >
            Take Photo
          </Button>
          <Button
            variant="secondary"
            onClick={handleFileUpload}
            leftIcon={<Upload size={18} />}
            disabled={uploading}
          >
            Upload Photo
          </Button>
        </div>
      )}

      {/* Photo count */}
      {photos.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-white/60">
          <ImageIcon size={16} />
          <span>{photos.length} / {maxPhotos} photos</span>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-white/40">
        Max {maxPhotos} photos • Up to 5MB each • JPG, PNG, WebP
      </p>
    </div>
  );
};

export default PhotoUpload;
