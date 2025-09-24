import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { fetchFriendRequests } from '../features/users/userSlice';
import { fetchNotifications } from '../features/notification/notificationSlice';
import FriendRequestCard from '../components/user/FriendRequestCard';
import { UserPlus, Bell, Heart, MessageCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';

const NotificationItem = ({ notif }) => {
  let message, linkTo, Icon;
  const isSenderAnonymous = notif.isActionAnonymous; // Đọc trực tiếp từ cờ isActionAnonymous

  switch (notif.type) {
    case 'friend_request_accepted':
      message = <><strong>{notif.sender.username}</strong> accepted your friend request.</>;
      linkTo = `/profile/${notif.sender.username}`;
      Icon = UserPlus;
      break;
    case 'like':
      message = <><strong>{notif.sender.username}</strong> liked your lantern.</>;
      linkTo = `/`; // Sẽ cần postId để link chính xác
      Icon = Heart;
      break;
    case 'comment':
      message = <><strong>{notif.sender.username}</strong> commented on your lantern.</>;
      linkTo = `/`;
      Icon = MessageCircle;
      break;
    default:
      message = "You have a new notification.";
      linkTo = "/";
      Icon = Bell;
  }
  
  const content = (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`p-3 flex items-center gap-4 rounded-lg transition-colors ${
        !notif.isRead ? 'bg-primary/10' : ''
      } hover:bg-secondary`}
    >
      <Avatar className="w-10 h-10">
        <AvatarImage src={isSenderAnonymous ? undefined : notif.sender.avatar} />
        <AvatarFallback>{notif.sender.username?.[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 text-sm">{message}</div>
      {!notif.isRead && <div className="w-2 h-2 bg-primary rounded-full shrink-0" />}
    </motion.div>
  );

  // Nếu là thông báo ẩn danh, không cho click vào
  if (isSenderAnonymous) {
    return <div className="cursor-default">{content}</div>;
  }

  return <Link to={linkTo}>{content}</Link>;
}


const NotificationsPage = () => {
  const dispatch = useDispatch();
  
  // Lấy state từ Redux
  const { requests, requestsStatus } = useSelector((state) => state.user);
  const { notifications, status: notifStatus } = useSelector((state) => state.notifications);
  
  // Fetch dữ liệu khi trang được tải lần đầu
  useEffect(() => {
    if (requestsStatus === 'idle') dispatch(fetchFriendRequests());
    if (notifStatus === 'idle') dispatch(fetchNotifications());
  }, [requestsStatus, notifStatus, dispatch]);

  // Lọc ra các thông báo không phải là lời mời kết bạn
  const activityNotifications = notifications.filter(n => n.type !== 'friend_request');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all"><Bell className="w-4 h-4 mr-2" /> All Activity</TabsTrigger>
          <TabsTrigger value="requests">
            <UserPlus className="w-4 h-4 mr-2" /> Friend Requests 
            {requests.length > 0 && 
              <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">{requests.length}</span>
            }
          </TabsTrigger>
        </TabsList>

        {/* Tab "All Activity" */}
        <TabsContent value="all" className="mt-6">
          <div className="bg-card p-4 rounded-2xl border border-border space-y-1">
            {notifStatus === 'loading' && <Skeleton className="h-24 w-full" />}
            {notifStatus === 'succeeded' && (
              activityNotifications.length > 0 ? (
                activityNotifications.map(notif => <NotificationItem key={notif._id} notif={notif} />)
              ) : <p className="text-center p-8 text-muted-foreground">No new activity.</p>
            )}
          </div>
        </TabsContent>

        {/* Tab "Friend Requests" */}
        <TabsContent value="requests" className="mt-6">
          {requestsStatus === 'loading' && <Skeleton className="h-24 w-full" />}
          {requestsStatus === 'succeeded' && (
            requests.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {requests.map(req => <FriendRequestCard key={req._id} request={req} />)}
                </AnimatePresence>
              </div>
            ) : <p className="text-center p-8 text-muted-foreground">No pending friend requests.</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsPage;