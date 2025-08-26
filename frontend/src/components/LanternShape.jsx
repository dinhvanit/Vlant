import React from 'react';
import { motion } from 'framer-motion';

const LanternShape = ({ children, className = '' }) => {
  return (
    <div className={`relative w-full max-w-sm mx-auto group ${className}`}>
      {/* Nắp trên của lồng đèn */}
      <div 
        className="relative h-8 bg-gradient-to-b from-secondary to-card/90 border-x-2 border-t-2 border-border/50 shadow-md"
        style={{ clipPath: 'ellipse(70% 100% at 50% 0%)' }}
      />

      {/* Thân lồng đèn chính */}
      <div className="relative bg-card/90 backdrop-blur-md border-2 border-y-0 border-border/50 p-6 flex flex-col">
        {/* Ánh sáng nền */}
        <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent pointer-events-none" />
        
        {/* Các thanh nan dọc trang trí */}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="absolute top-0 bottom-0 w-px bg-border/30" style={{ left: `${(i + 1) * 16.66}%`}} />
        ))}

        {/* Nội dung sẽ được đặt vào đây */}
        <div className="relative z-10 h-full flex flex-col">
          {children}
        </div>
      </div>

      {/* Đáy lồng đèn */}
      <div 
        className="relative h-8 bg-gradient-to-t from-secondary to-card/90 border-x-2 border-b-2 border-border/50 shadow-md"
        style={{ clipPath: 'ellipse(70% 100% at 50% 100%)' }}
      />
      
      {/* Dây và tua rua */}
      <div className="mx-auto w-8 h-12 mt-1 flex flex-col items-center">
        <div className="w-px h-6 bg-border" />
        <div className="w-6 h-4 bg-destructive/80 rounded-full shadow-md tassel" />
      </div>
    </div>
  );
};

export default LanternShape;