import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";

import AuthModal from "../components/auth/AuthModal";
import LandingContent from "../components/LandingContent";
import MainLayout from "../layouts/MainLayout"; // Layout chính khi đã đăng nhập
import PostFeed from "../components/PostFeed"; // Component hiển thị các bài viết

const HomePage = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (userInfo) {
    return (
      <MainLayout>
        <PostFeed />
      </MainLayout>
    );
  }

  return (
    <>
      <LandingContent
        onLoginClick={() => setIsAuthModalOpen(true)}
        onRegisterClick={() => setIsAuthModalOpen(true)}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default HomePage;
