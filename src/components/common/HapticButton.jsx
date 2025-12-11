// src/components/common/HapticButton.jsx
import React from 'react';
import Button from './Button';
import { hapticFeedback } from '../../utils/haptics';

/**
 * Button component with built-in haptic feedback
 * Wraps the standard Button component and adds haptic feedback on click
 */
export const HapticButton = ({ 
  onClick, 
  hapticType = 'medium',
  disabled,
  ...props 
}) => {
  const handleClick = (e) => {
    if (!disabled) {
      hapticFeedback(hapticType);
      if (onClick) {
        onClick(e);
      }
    }
  };

  return <Button {...props} onClick={handleClick} disabled={disabled} />;
};

export default HapticButton;
