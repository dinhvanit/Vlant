import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Bell, UserPlus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import api from '../api/axios'; // Để fetch các thông báo cũ

const Notifications = () => {
  const socket = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch các thông báo cũ khi component mount
  useEffect(() => {
    const fetchOldNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchOldNotifications();
  }, []);

  // Lắng nghe các thông báo mới từ Socket.IO
  useEffect(() => {
    if (socket) {
      socket.on('getNotification', (newNotification) => {
        // Giả sử server gửi về { senderName, type }
        const formattedNotif = {
          _id: Date.now(), // Tạo ID tạm thời
          sender: { username: newNotification.senderName },
          type: newNotification.type,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        setNotifications((prev) => [formattedNotif, ...prev]);
        setUnreadCount((prev) => prev + 1);
      });
      
      // Cleanup listener
      return () => socket.off('getNotification');
    }
  }, [socket]);
  
  const handleOpenChange = (isOpen) => {
    if (isOpen && unreadCount > 0) {
      // Khi mở popover, đánh dấu đã đọc
      api.put('/notifications/read');
      setUnreadCount(0);
      // Có thể cập nhật isRead trên state local nếu muốn
    }
  };
  
  const getNotificationMessage = (notif) => {
      switch (notif.type) {
          case 'friend_request':
              return <p><span className="font-bold">{notif.sender.username}</span> sent you a friend request.</p>;
          case 'like':
              return <p><span className="font-bold">{notif.sender.username}</span> liked your lantern.</p>;
          // Thêm các case khác
          default:
              return <p>You have a new notification.</p>;
      }
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">{unreadCount}</span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="p-4">
            <h4 className="font-medium leading-none mb-4">Notifications</h4>
            <div className="space-y-2">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div key={notif._id} className="text-sm">
                            {getNotificationMessage(notif)}
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No new notifications.</p>
                )}
            </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;