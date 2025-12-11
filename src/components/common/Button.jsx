// src/components/common/Button.jsx
import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 
    font-semibold rounded-full transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-purple-600 to-indigo-600 
      text-white hover:from-purple-700 hover:to-indigo-700
      hover:shadow-lg hover:-translate-y-0.5
      focus:ring-purple-500
    `,
    secondary: `
      bg-slate-800 text-white border border-white/10
      hover:bg-slate-700 focus:ring-slate-500
    `,
    ghost: `
      bg-transparent text-white/60 
      hover:text-white hover:bg-white/5
      focus:ring-white/20
    `,
    danger: `
      bg-red-600 text-white 
      hover:bg-red-700 hover:shadow-lg hover:-translate-y-0.5
      focus:ring-red-500
    `,
    success: `
      bg-green-600 text-white 
      hover:bg-green-700 hover:shadow-lg hover:-translate-y-0.5
      focus:ring-green-500
    `,
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${widthClass}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
};

export default Button;
