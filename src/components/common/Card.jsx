// src/components/common/Card.jsx
import React from 'react';

export const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = `
    rounded-2xl transition-all duration-200
  `;

  const variants = {
    default: `
      bg-slate-800/80 backdrop-blur-sm
      border border-white/5
    `,
    elevated: `
      bg-gradient-to-br from-slate-800/90 to-slate-900/90
      backdrop-blur-md shadow-xl
    `,
    glass: `
      bg-white/5 backdrop-blur-md
      border border-white/10
    `,
    interactive: `
      bg-slate-800/80 backdrop-blur-sm
      border border-white/5
      hover:bg-slate-700/80 hover:border-white/10
      hover:shadow-lg hover:-translate-y-1
      cursor-pointer
    `,
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${paddings[padding]}
        ${className}
      `.replace(/\s+/g, ' ').trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
