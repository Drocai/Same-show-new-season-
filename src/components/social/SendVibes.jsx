// src/components/social/SendVibes.jsx
import React, { useState } from 'react';
import { Send, Zap, Heart, ThumbsUp, Star, Sparkles, X } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Textarea } from '../common/Input';
import { supabase } from '../../lib/supabase';
import { hapticFeedback } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';

const VIBE_TYPES = [
  { id: 'positive', label: 'Positive Vibes', icon: Sparkles, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  { id: 'energy', label: 'Energy Boost', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  { id: 'love', label: 'Good Vibes', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/20' },
  { id: 'appreciation', label: 'Appreciation', icon: ThumbsUp, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  { id: 'excellence', label: 'Excellence', icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/20' },
];

export const SendVibes = ({ recipientId, recipientName, locationId, onClose, onSent }) => {
  const { user, profile } = useAuth();
  const [selectedType, setSelectedType] = useState('positive');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!user) {
      setError('You must be logged in to send vibes');
      return;
    }

    if (!message.trim()) {
      setError('Please add a message');
      return;
    }

    setSending(true);
    setError('');
    hapticFeedback('light');

    try {
      // Create vibe transaction
      const { data, error: sendError } = await supabase
        .from('vibes_sent')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          location_id: locationId,
          vibe_type: selectedType,
          message: message.trim(),
        })
        .select()
        .single();

      if (sendError) throw sendError;

      // Award vibrations to both sender and recipient
      await Promise.all([
        // Sender gets +5 vibrations
        supabase.rpc('add_vibrations', {
          user_id: user.id,
          amount: 5,
          reason: 'Sent vibes'
        }),
        // Recipient gets +10 vibrations
        supabase.rpc('add_vibrations', {
          user_id: recipientId,
          amount: 10,
          reason: 'Received vibes'
        })
      ]);

      hapticFeedback('success');
      
      if (onSent) {
        onSent(data);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Error sending vibes:', err);
      setError('Failed to send vibes. Please try again.');
      hapticFeedback('error');
    } finally {
      setSending(false);
    }
  };

  const selectedVibeType = VIBE_TYPES.find(v => v.id === selectedType);
  const Icon = selectedVibeType?.icon || Sparkles;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${selectedVibeType?.bg} flex items-center justify-center`}>
          <Icon size={32} className={selectedVibeType?.color} />
        </div>
        <h3 className="text-xl font-bold mb-2">Send Vibes</h3>
        <p className="text-white/60">
          Send {selectedVibeType?.label.toLowerCase()} to <span className="text-purple-400">{recipientName}</span>
        </p>
      </div>

      {/* Vibe Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-white/80">Choose Vibe Type</label>
        <div className="grid grid-cols-2 gap-2">
          {VIBE_TYPES.map((type) => {
            const TypeIcon = type.icon;
            const isSelected = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id);
                  hapticFeedback('light');
                }}
                className={`
                  p-3 rounded-xl border-2 transition-all
                  ${isSelected 
                    ? `${type.bg} border-current ${type.color}` 
                    : 'bg-slate-800 border-white/10 text-white/60 hover:border-white/20'
                  }
                `}
              >
                <TypeIcon size={20} className="mx-auto mb-1" />
                <p className="text-xs font-medium">{type.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Message */}
      <div>
        <Textarea
          label="Your Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share why you're sending these vibes..."
          rows={4}
          maxLength={280}
        />
        <p className="text-xs text-white/40 mt-1 text-right">
          {message.length} / 280
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Rewards Info */}
      <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
        <div className="flex items-center gap-2 text-sm">
          <Zap size={16} className="text-purple-400" />
          <span className="text-white/80">
            You'll earn <span className="font-bold text-purple-400">+5 vibrations</span>
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm mt-2">
          <Zap size={16} className="text-purple-400" />
          <span className="text-white/80">
            {recipientName} will receive <span className="font-bold text-purple-400">+10 vibrations</span>
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          fullWidth
          onClick={onClose}
          disabled={sending}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={handleSend}
          loading={sending}
          disabled={sending || !message.trim()}
          leftIcon={<Send size={18} />}
        >
          Send Vibes
        </Button>
      </div>
    </div>
  );
};

export const SendVibesModal = ({ isOpen, onClose, recipientId, recipientName, locationId }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <SendVibes
        recipientId={recipientId}
        recipientName={recipientName}
        locationId={locationId}
        onClose={onClose}
      />
    </Modal>
  );
};

export default SendVibes;
