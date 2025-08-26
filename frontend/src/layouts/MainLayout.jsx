import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "../components/Sidebar";
import CreatePostModal from "../components/CreatePostModal";
import FloatingLantern from "../components/FloatingLantern";
import { createPost } from "../features/posts/postSlice";

const MainLayout = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const dispatch = useDispatch();

  const handleCreatePost = (postData) => { 
    // Dispatch trực tiếp object đó, không gói thêm gì cả
    dispatch(createPost(postData)); 
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex relative">
      {/* LỚP NỀN: Bầu trời đêm */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Có thể thêm hiệu ứng sao ở đây bằng CSS hoặc component */}
        <FloatingLantern
          size="sm"
          className="top-[15%] left-[5%] opacity-30"
          delay={0}
        />
        <FloatingLantern
          size="md"
          className="top-[30%] right-[10%] opacity-40"
          delay={3}
        />
        <FloatingLantern
          size="sm"
          className="bottom-[20%] right-[15%] opacity-30"
          delay={1}
        />
        <FloatingLantern
          size="lg"
          className="bottom-[10%] left-[20%] opacity-20"
          delay={5}
        />
      </div>

      {/* Sidebar và Main Content phải có z-index cao hơn để nổi lên trên */}
      <div className="relative z-10 flex w-full">
        <Sidebar
          userInfo={userInfo}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />

        <main className="flex-1 ml-64 p-8">
          <Outlet />
        </main>
      </div>

      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default MainLayout;
