import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { addNotification } from '../features/notification/notificationSlice';

// 1. Tạo Context
const SocketContext = createContext();

// 2. Tạo custom hook để dễ dàng truy cập socket
export const useSocket = () => {
  return useContext(SocketContext);
};

// 3. Tạo Provider để bọc ứng dụng
export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // Chỉ kết nối socket nếu có user đăng nhập (không phải guest)
    if (userInfo && userInfo.role !== 'guest') {
      const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
      setSocket(newSocket);
      
      // Gửi userId lên server để định danh
      newSocket.emit('addUser', userInfo._id);
      
      newSocket.on('new_notification', (notificationData) => {
        // Khi nhận được thông báo mới, dispatch action để thêm vào Redux store
        dispatch(addNotification(notificationData));
      });
      
      return () => newSocket.close();
    } else {
      // Ngắt kết nối nếu user logout hoặc là guest
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [userInfo, dispatch]); // Thêm dispatch vào dependency array

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};