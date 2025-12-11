// src/components/social/VibesFeed.jsx
import React, { useState, useEffect } from 'react';
import { Zap, Heart, ThumbsUp, Star, Sparkles, MapPin, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatRelativeTime } from '../../utils';
import Loading from '../common/Loading';

const VIBE_ICONS = {
  positive: Sparkles,
  energy: Zap,
  love: Heart,
  appreciation: ThumbsUp,
  excellence: Star,
};

const VIBE_COLORS = {
  positive: 'text-yellow-400 bg-yellow-500/20',
  energy: 'text-purple-400 bg-purple-500/20',
  love: 'text-pink-400 bg-pink-500/20',
  appreciation: 'text-blue-400 bg-blue-500/20',
  excellence: 'text-amber-400 bg-amber-500/20',
};

export const VibesFeed = ({ userId, limit = 20 }) => {
  const [vibes, setVibes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('received'); // 'received' or 'sent'

  useEffect(() => {
    loadVibes();
    
    // Subscribe to real-time updates
    const subscription = supabase
      .channel('vibes_feed')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'vibes_sent',
        filter: `recipient_id=eq.${userId}`
      }, (payload) => {
        setVibes(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, filter]);

  const loadVibes = async () => {
    setLoading(true);
    try {
      const query = supabase
        .from('vibes_sent')
        .select(`
          *,
          sender:sender_id(id, username, avatar_url, resonance_rank),
          recipient:recipient_id(id, username, avatar_url, resonance_rank),
          location:location_id(name, location_type)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (filter === 'received') {
        query.eq('recipient_id', userId);
      } else {
        query.eq('sender_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVibes(data || []);
    } catch (error) {
      console.error('Error loading vibes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading vibes..." />;
  }

  if (vibes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Zap size={32} className="text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Vibes Yet</h3>
        <p className="text-white/60 text-sm">
          {filter === 'received' 
            ? "You haven't received any vibes yet" 
            : "You haven't sent any vibes yet"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
        <button
          onClick={() => setFilter('received')}
          className={`
            flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
            ${filter === 'received' 
              ? 'bg-purple-600 text-white' 
              : 'text-white/60 hover:text-white'
            }
          `}
        >
          Received
        </button>
        <button
          onClick={() => setFilter('sent')}
          className={`
            flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors
            ${filter === 'sent' 
              ? 'bg-purple-600 text-white' 
              : 'text-white/60 hover:text-white'
            }
          `}
        >
          Sent
        </button>
      </div>

      {/* Vibes List */}
      <div className="space-y-3">
        {vibes.map((vibe) => {
          const Icon = VIBE_ICONS[vibe.vibe_type] || Sparkles;
          const colorClass = VIBE_COLORS[vibe.vibe_type] || VIBE_COLORS.positive;
          const otherUser = filter === 'received' ? vibe.sender : vibe.recipient;

          return (
            <div
              key={vibe.id}
              className="p-4 bg-slate-800 rounded-xl border border-white/5 hover:border-white/10 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                {/* Avatar */}
                {otherUser?.avatar_url ? (
                  <img
                    src={otherUser.avatar_url}
                    alt={otherUser.username}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <User size={20} className="text-purple-400" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold truncate">
                      {otherUser?.username || 'Anonymous'}
                    </span>
                    <div className={`p-1.5 rounded-lg ${colorClass}`}>
                      <Icon size={14} />
                    </div>
                  </div>
                  <p className="text-xs text-white/40">
                    {formatRelativeTime(vibe.created_at)}
                  </p>
                </div>

                {/* Vibrations */}
                <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full">
                  <Zap size={12} className="text-purple-400" />
                  <span className="text-xs font-semibold text-purple-300">
                    +{filter === 'received' ? '10' : '5'}
                  </span>
                </div>
              </div>

              {/* Message */}
              <p className="text-white/80 text-sm mb-3">{vibe.message}</p>

              {/* Location */}
              {vibe.location && (
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <MapPin size={12} />
                  <span>{vibe.location.name}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VibesFeed;
