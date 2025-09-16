import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['like', 'comment', 'friend_request', 'friend_request_accepted'],
    required: true,
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // Chỉ cần cho 'like' và 'comment'
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;