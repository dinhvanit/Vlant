import asyncHandler from 'express-async-handler';
import Notification from '../models/Notification.model.js';
import Comment from '../models/Comment.model.js';

// @desc    Lấy tất cả thông báo của người dùng hiện tại
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const rawNotifications = await Notification.find({ recipient: req.user._id })
    .populate({ path: 'sender', select: 'username avatar' })
    .sort({ createdAt: -1 })
    .limit(20);

  // Xử lý để ẩn danh tính cho các thông báo comment ẩn danh
  const formattedNotifications = await Promise.all(
    rawNotifications.map(async (notif) => {
      let notifObject = notif.toObject();

      // Chỉ cần kiểm tra với thông báo loại 'comment'
      if (notif.type === 'comment') {
        // Tìm comment tương ứng để biết nó có ẩn danh không
        // có thể tối ưu bằng cách thêm isAnonymous vào schema của Notification, cái này để sau t làm
        const relatedComment = await Comment.findOne({ post: notif.post, sender: notif.sender, createdAt: notif.createdAt });
        if (relatedComment && relatedComment.isAnonymous) {
            notifObject.sender.username = "An Anonymous Wanderer";
            notifObject.sender.avatar = "default_anonymous_avatar_url";
        }
      }
      return notifObject;
    })
  );

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