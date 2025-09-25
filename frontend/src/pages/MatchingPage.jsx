import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { Loader2 } from 'lucide-react'; // Icon xoay tròn

const MatchingPage = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // Chỉ chạy logic nếu có socket và user đã đăng nhập
    if (socket && userInfo) {
      // Gửi yêu cầu tham gia hàng đợi lên server
      console.log('Emitting joinAnonymousQueue');
      socket.emit('joinAnonymousQueue', userInfo._id);

      // Lắng nghe sự kiện 'matchFound' từ server
      socket.on('matchFound', ({ conversationId }) => {
        console.log('Match found! Conversation ID:', conversationId);
        // Khi tìm thấy, điều hướng đến trang Messenger và truyền ID cuộc trò chuyện
        // `replace: true` để người dùng không thể bấm "Back" quay lại trang chờ
        navigate('/messages', { 
          replace: true, 
          state: { newConversationId: conversationId } 
        });
      });

      // Cleanup function: Rời khỏi hàng đợi khi component unmount
      return () => {
        console.log('Emitting leaveAnonymousQueue');
        socket.emit('leaveAnonymousQueue');
        socket.off('matchFound'); // Gỡ bỏ listener để tránh memory leak
      };
    }
  }, [socket, userInfo, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-background"
    >
      {/* Animation Lồng đèn đang bay lên */}
      <motion.div
        animate={{ y: [0, -40, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-8xl mb-8"
      >
        🏮
      </motion.div>

      <h1 className="text-3xl font-bold text-primary mb-4">
        Releasing Your Lantern...
      </h1>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        Waiting for another soul to catch your light in the vast night sky. Please wait a moment.
      </p>

      <div className="flex items-center gap-3 text-foreground">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Searching for a connection...</span>
      </div>
    </motion.div>
  );
};

export default MatchingPage;