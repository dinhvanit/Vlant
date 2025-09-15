import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Routes, Route } from 'react-router-dom';
import { openAuthModal, closeAuthModal } from './features/ui/uiSlice';

import LandingPage from './pages/LandingPage';
import AuthModal from './components/auth/AuthModal';
import MainLayout from './layouts/MainLayout';
import PostFeed from './components/PostFeed';
import ProfilePage from './pages/ProfilePage';
import ExplorePage from './pages/ExplorePage';

const App = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { isAuthModalOpen } = useSelector((state) => state.ui);
  const [isGuest, setIsGuest] = useState(false);

  const handleGuestContinue = () => {
    setIsGuest(true);
    dispatch(closeAuthModal());
  };

  // Nếu chưa đăng nhập và chưa phải guest -> Hiển thị Landing Page
  if (!userInfo && !isGuest) {
    return (
      <>
        <LandingPage
          onLoginClick={() => dispatch(openAuthModal())}
          onRegisterClick={() => dispatch(openAuthModal())}
        />
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => dispatch(closeAuthModal())}
          onGuestClick={handleGuestContinue}
        />
      </>
    );
  }

  // Nếu đã đăng nhập hoặc là guest -> Hiển thị ứng dụng chính với cấu trúc Route lồng nhau
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* Router render vào Outlet như ổ cắm */}
        
        <Route index element={<PostFeed />} />
        
        <Route path="explore" element={<ExplorePage />} />
        <Route path="profile/:username" element={<ProfilePage />} />

        {/* <Route path="messages" element={<MessagesPage />} /> */}
      </Route>
      {/* Ví dụ: <Route path="/settings" element={<SettingsPage />} /> */}
    </Routes>
  );
};

export default App;