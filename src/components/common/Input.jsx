// src/components/common/Input.jsx
import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className = '',
  ...props
}) => {
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white/80 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            {leftIcon}
          </div>
        )}
        
        <input
          className={`
            w-full px-4 py-3 rounded-xl
            bg-slate-800 border border-white/10
            text-white placeholder-white/40
            transition-all duration-200
            focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          `}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-white/40">{helperText}</p>
      )}
    </div>
  );
};

export const Textarea = ({
  label,
  error,
  helperText,
  fullWidth = true,
  rows = 4,
  className = '',
  ...props
}) => {
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white/80 mb-2">
          {label}
        </label>
      )}
      
      <textarea
        rows={rows}
        className={`
          w-full px-4 py-3 rounded-xl
          bg-slate-800 border border-white/10
          text-white placeholder-white/40
          transition-all duration-200
          focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          resize-none
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
        `}
        {...props}
      />
      
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-white/40">{helperText}</p>
      )}
    </div>
  );
};

export const Select = ({
  label,
  error,
  helperText,
  options = [],
  fullWidth = true,
  className = '',
  ...props
}) => {
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <div className={`${widthClass} ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-white/80 mb-2">
          {label}
        </label>
      )}
      
      <select
        className={`
          w-full px-4 py-3 rounded-xl
          bg-slate-800 border border-white/10
          text-white
          transition-all duration-200
          focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-2 text-sm text-red-400">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-white/40">{helperText}</p>
      )}
    </div>
  );
};

export default Input;
