import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { openAuthModal, closeAuthModal } from './features/ui/uiSlice';

import LandingPage from './pages/LandingPage';
import AuthModal from './components/auth/AuthModal';
import MainLayout from './layouts/MainLayout';
import PostFeed from './components/PostFeed';
import ProfilePage from './pages/ProfilePage'; // Ví dụ trang khác

const App = () => {
  console.log('--- App component is RENDERING ---');

  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => {
    console.log('Reading from Redux store. UserInfo is:', state.auth.userInfo); // 2. Kiểm tra state từ Redux
    return state.auth;
  });


  const { isAuthModalOpen } = useSelector((state) => state.ui);
  const [isGuest, setIsGuest] = useState(false);

  const handleGuestContinue = () => {
    setIsGuest(true);
    dispatch(closeAuthModal());
  };

  // Nếu chưa đăng nhập và chưa phải guest -> Hiển thị Landing Page
  if (!userInfo && !isGuest) {
    console.log('Condition is TRUE: Rendering LandingPage');
    return (
      <>
        <LandingPage
          onLoginClick={() => dispatch(openAuthModal())}
          onRegisterClick={() => dispatch(openAuthModal())}
          onGuestClick={handleGuestContinue}
        />
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => dispatch(closeAuthModal())}
          onGuestClick={handleGuestContinue}
        />
      </>
    );
  }


  console.log('Condition is FALSE: Rendering Main App'); 
  // Nếu đã đăng nhập hoặc là guest -> Hiển thị ứng dụng chính
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<PostFeed />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
      </Routes>
    </MainLayout>
  );
};

export default App;