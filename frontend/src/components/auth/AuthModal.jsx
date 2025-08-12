import React, { useState } from 'react';
import {Dialog, DialogContent} from '../ui/dialog'
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthModal = ({ isOpen, onClose, onGuestClick }) => {
  const [isLoginView, setIsLoginView] = useState(true);

  const handleSwitch = () => {
    setIsLoginView(!isLoginView);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setIsLoginView(true);
    }, 300); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card/95 backdrop-blur-md border-border/50 rounded-3xl shadow-2xl p-8 max-w-md">
        <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center glow-effect">
              <span className="text-3xl">🏮</span>
            </div>
        </div>
        
        {isLoginView ? (
          <LoginForm 
            onSwitch={handleSwitch} 
            onGuestClick={onGuestClick} 
          />
        ) : (
          <RegisterForm onSwitch={handleSwitch} />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;