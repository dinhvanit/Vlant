import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.model.js';
import Comment from '../models/Comment.model.js';

// @desc    Lấy tất cả thông báo của người dùng hiện tại
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate({ path: 'sender', select: 'username avatar' })
    .sort({ createdAt: -1 })
    .limit(30);

  // Xử lý ẩn danh tính ngay trên kết quả đã có
  const formattedNotifications = notifications.map(notif => {
    let notifObject = notif.toObject();

    if (notifObject.isActionAnonymous) {
      notifObject.sender.username = "An Anonymous Wanderer";
      notifObject.sender.avatar = "default_anonymous_avatar_url"; // Link ảnh mặc định
    }
    
    return notifObject;
  });

  res.json(formattedNotifications);
});

// @desc    Đánh dấu các thông báo là đã đọc
// @route   PUT /api/notifications/read
// @access  Private
const markNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.status(200).json({ message: 'Notifications marked as read.' });
});

export { getNotifications, markNotificationsAsRead };