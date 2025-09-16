import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.model.js';

// @desc    Lấy tất cả thông báo của người dùng hiện tại
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .populate({
      path: 'sender',
      select: 'username avatar', // Lấy username và avatar của người gửi
    })
    .sort({ createdAt: -1 }) // Sắp xếp mới nhất trước
    .limit(20); // Giới hạn 20 thông báo gần nhất

  res.json(notifications);
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