import React from 'react';

const FloatingLantern = ({ size = 'md', className = '', delay = 0 }) => {
  const sizeClasses = {
    sm: 'w-8 h-10',
    md: 'w-12 h-14',
    lg: 'w-16 h-20'
  };

  return (
    <div
      className={`floating-lantern ${sizeClasses[size]} ${className}`}
      style={{
        animationDelay: `${delay}s`,
        position: 'absolute',
        opacity: 0.7
      }}
    >
      {/* Lantern body */}
      <div className="relative w-full h-full">
        {/* Top cap */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1 bg-amber-600 rounded-full"></div>

        {/* Main lantern body */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-4/5 h-4/5 bg-gradient-to-b from-amber-400 to-orange-500 rounded-lg shadow-lg glow-effect">
          {/* Inner glow */}
          <div className="w-full h-full bg-gradient-to-b from-yellow-300/20 to-transparent rounded-lg"></div>

          {/* Cross pattern */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-0.5 bg-amber-700/30"></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-0.5 h-full bg-amber-700/30"></div>
          </div>
        </div>

        {/* Bottom tassel */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 h-2 bg-red-600"></div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-700 rounded-full"></div>
      </div>
    </div>
  );
};

export default FloatingLantern;
