// src/components/common/Toast.jsx
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const types = {
    success: {
      icon: CheckCircle,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
    },
    error: {
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
    },
    warning: {
      icon: AlertCircle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/30',
    },
    info: {
      icon: Info,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
    },
  };

  const config = types[type];
  const Icon = config.icon;

  return (
    <div
      className={`
        fixed bottom-20 left-1/2 -translate-x-1/2 z-50
        flex items-center gap-3 px-4 py-3 rounded-xl
        bg-slate-800/95 backdrop-blur-md
        border ${config.border}
        shadow-xl animate-slide-up
        max-w-[90%] md:max-w-md
      `}
    >
      <Icon className={`flex-shrink-0 ${config.color}`} size={20} />
      <p className="flex-1 text-sm text-white">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-white/5 transition-colors"
      >
        <X size={16} className="text-white/60" />
      </button>
    </div>
  );
};

export default Toast;
