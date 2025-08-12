import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { openAuthModal, closeAuthModal } from './features/ui/uiSlice';

import LandingPage from './pages/LandingPage';
import AuthModal from './components/auth/AuthModal';
import MainLayout from './layouts/MainLayout';
// import PostFeed from './components/PostFeed';
// import ProfilePage from './pages/ProfilePage'; // Ví dụ trang khác

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

  // Nếu đã đăng nhập hoặc là guest -> Hiển thị ứng dụng chính
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<PostFeed />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          {/* Thêm các route khác cho ứng dụng chính ở đây */}
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;