import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useSocket } from '../context/SocketContext';
import { Bell } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { fetchNotifications, resetUnreadCount, addNotification } from '../features/notification/notificationSlice';
import api from '../api/axios';

// Component con để render một dòng thông báo
const NotificationItem = ({ notif, closePopover }) => {
  const navigate = useNavigate();
  const isSenderAnonymous = notif.isActionAnonymous;
  let message;

  switch (notif.type) {
    case 'friend_request_accepted':
      message = <><strong>{notif.sender.username}</strong> accepted your friend request.</>;
      break;
    case 'like':
      message = <><strong>{notif.sender.username}</strong> liked your lantern.</>;
      break;
    case 'comment':
      message = <><strong>{notif.sender.username}</strong> commented on your lantern.</>;
      break;
    case 'friend_request':
      message = <><strong>{notif.sender.username}</strong> sent you a friend request.</>;
      break;
    default:
      message = "You have a new notification.";
  }

  const handleClick = () => {
    if (isSenderAnonymous) return; // Không làm gì nếu là ẩn danh

    // Điều hướng dựa trên loại thông báo
    if (notif.type === 'friend_request' || notif.type === 'friend_request_accepted') {
        navigate(`/notifications?tab=requests`); // Chuyển đến tab requests
    } else if (notif.post) {
        // Sau này sẽ mở PostDetailModal
        console.log("Navigate to post:", notif.post);
    }
    closePopover(); // Đóng popover sau khi click
  }

  return (
    <div 
      onClick={handleClick}
      className={`p-2 flex items-center gap-3 rounded-lg transition-colors ${!notif.isRead ? 'bg-primary/10' : ''} ${!isSenderAnonymous && 'cursor-pointer hover:bg-secondary'}`}
    >
      <Avatar className="w-8 h-8">
        <AvatarImage src={isSenderAnonymous ? undefined : notif.sender.avatar} />
        <AvatarFallback>{notif.sender.username?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 text-sm">{message}</div>
    </div>
  );
};


const Notifications = () => {
  const dispatch = useDispatch();
  const socket = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  
  // Đọc state trực tiếp từ Redux
  const { notifications, unreadCount, status } = useSelector((state) => state.notifications);

  // Fetch dữ liệu lần đầu
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchNotifications());
    }
  }, [status, dispatch]);
  
  // Xử lý khi mở popover
  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open && unreadCount > 0) {
      // Gọi API để đánh dấu đã đọc ở backend
      api.put('/notifications/read');
      // Cập nhật ngay lập tức UI
      dispatch(resetUnreadCount());
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
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
      <PopoverContent className="w-80 p-0">
        <div className="p-3 border-b border-border">
            <h4 className="font-medium leading-none">Notifications</h4>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
            {notifications.length > 0 ? (
                notifications.slice(0, 7).map(notif => ( // Chỉ hiển thị 7 thông báo mới nhất
                    <NotificationItem key={notif._id} notif={notif} closePopover={() => setIsOpen(false)} />
                ))
            ) : (
                <p className="p-8 text-center text-sm text-muted-foreground">You have no notifications yet.</p>
            )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default Notifications;