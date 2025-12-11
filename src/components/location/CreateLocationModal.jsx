// src/components/location/CreateLocationModal.jsx
import React, { useState } from 'react';
import { MapPin, Plus, X } from 'lucide-react';
import Modal from '../common/Modal';
import { Input, Select, Textarea } from '../common/Input';
import Button from '../common/Button';
import LocationSearch from './LocationSearch';
import { LOCATION_TYPES } from '../../constants';
import { createLocation } from '../../lib/supabase';
import { hapticFeedback } from '../../utils';

export const CreateLocationModal = ({ isOpen, onClose, onLocationCreated, userLocation }) => {
  const [step, setStep] = useState(1); // 1: Search, 2: Details
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location_type: 'cafe',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearchSelect = (location) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      location_type: location.location_type || 'other',
      address: location.address || '',
      city: location.city || '',
      state: location.state || '',
      country: location.country || 'USA',
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setStep(2);
    hapticFeedback('light');
  };

  const handleManualEntry = () => {
    if (userLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: userLocation.lat,
        longitude: userLocation.lng,
      }));
    }
    setStep(2);
    hapticFeedback('light');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.location_type) {
        throw new Error('Name and type are required');
      }

      if (!formData.latitude || !formData.longitude) {
        throw new Error('Location coordinates are required');
      }

      // Create location
      const { data, error: createError } = await createLocation(formData);
      
      if (createError) throw createError;

      hapticFeedback('success');
      onLocationCreated(data);
      handleClose();
    } catch (err) {
      setError(err.message);
      hapticFeedback('error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedLocation(null);
    setFormData({
      name: '',
      location_type: 'cafe',
      address: '',
      city: '',
      state: '',
      country: 'USA',
      latitude: null,
      longitude: null,
    });
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? 'Add New Location' : 'Location Details'}
      size="lg"
    >
      {step === 1 ? (
        <div className="space-y-4">
          <p className="text-white/60 text-sm">
            Search for a location or add it manually
          </p>

          <LocationSearch
            onSelect={handleSearchSelect}
            placeholder="Search for a place..."
          />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-white/40">or</span>
            </div>
          </div>

          <Button
            variant="secondary"
            fullWidth
            onClick={handleManualEntry}
            leftIcon={<Plus size={18} />}
          >
            Add Manually
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Location Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Downtown Coffee House"
            required
          />

          <Select
            label="Location Type"
            name="location_type"
            value={formData.location_type}
            onChange={handleChange}
            options={LOCATION_TYPES.map(type => ({
              value: type.value,
              label: `${type.icon} ${type.label}`
            }))}
          />

          <Input
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="123 Main St"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="New York"
            />
            <Input
              label="State"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="NY"
            />
          </div>

          <Input
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="USA"
          />

          {selectedLocation && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-purple-300">
                <MapPin size={16} />
                <span>
                  Coordinates: {formData.latitude?.toFixed(6)}, {formData.longitude?.toFixed(6)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Create Location
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default CreateLocationModal;
