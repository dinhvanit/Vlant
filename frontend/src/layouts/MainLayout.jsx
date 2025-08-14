import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from '../components/Sidebar';
import CreatePostModal from '../components/CreatePostModal';
import { createPost } from '../features/posts/postSlice';

const MainLayout = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const dispatch = useDispatch();

  const handleCreatePost = (content) => {
    // Dispatch thunk createPost với dữ liệu từ modal
    dispatch(createPost({ content }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Truyền hàm mở modal xuống Sidebar */}
      <Sidebar userInfo={userInfo} onOpenCreateModal={() => setIsCreateModalOpen(true)} />
      
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>

      {/* Render Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default MainLayout;