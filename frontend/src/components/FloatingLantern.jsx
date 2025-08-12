import React from 'react';

const FloatingLantern = ({ size = 'md', className = '', delay = 0 }) => {
  const sizeClasses = {
    sm: 'w-12 h-16',
    md: 'w-20 h-28',
    lg: 'w-28 h-40',
  };

  return (
    <div
      className={`absolute ${sizeClasses[size]} floating-lantern ${className}`}
      style={{ animationDelay: `${delay}s`, animationDuration: `${Math.random() * 4 + 6}s` }}
    >
      <div className="w-full h-full bg-primary/70 rounded-full blur-2xl opacity-50 glow-effect"></div>
    </div>
  );
};

export default FloatingLantern;