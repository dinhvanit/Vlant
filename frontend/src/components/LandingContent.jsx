import React from 'react';
import FloatingLantern from '/FloatingLantern';

// Component này nhận 2 hàm để mở modal
const LandingContent = ({ onLoginClick, onRegisterClick }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <FloatingLantern size="lg" className="top-[10%] left-[5%]" delay={0} />
        <FloatingLantern size="md" className="top-[20%] right-[10%]" delay={2} />
        <FloatingLantern size="sm" className="top-[60%] left-[15%]" delay={4} />
        <FloatingLantern size="md" className="top-[70%] right-[25%]" delay={1} />
        <FloatingLantern size="lg" className="bottom-[5%] right-[5%]" delay={3} />
      </div>
      
      <h1 className="text-5xl md:text-6xl font-bold text-primary mb-4 glow-effect">Vlant</h1>
      <p className="text-lg text-muted-foreground max-w-xl mb-8">
        Release your anonymous thoughts into the night sky, and connect with others through the warmth of shared feelings.
      </p>
      <div className="flex gap-4">
        <button onClick={onLoginClick} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold ...">
          Login
        </button>
        <button onClick={onRegisterClick} className="px-8 py-3 rounded-xl bg-secondary text-secondary-foreground font-bold ...">
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default LandingContent;