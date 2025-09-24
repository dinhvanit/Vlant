import asyncHandler from 'express-async-handler';
import Conversation from '../models/Conversation.model.js';
import Message from '../models/Message.model.js';

// @desc    Gửi một tin nhắn
// @route   POST /api/messages/send/:receiverId
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { receiverId } = req.params;
  const senderId = req.user._id;

  // 1. Tìm xem đã có cuộc trò chuyện giữa 2 người này chưa
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  // 2. Nếu chưa có, tạo một cuộc trò chuyện mới
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  // 3. Tạo tin nhắn mới
  const newMessage = new Message({
    senderId,
    receiverId,
    content,
  });

  // 4. Thêm tin nhắn vào cuộc trò chuyện và lưu lại
  if (newMessage) {
    conversation.messages.push(newMessage._id);
  }
  
  // Chạy song song 2 tác vụ lưu để tiết kiệm thời gian
  await Promise.all([conversation.save(), newMessage.save()]);

  const sendMessageRealtime = req.app.locals.sendMessageRealtime;
  sendMessageRealtime(receiverId, newMessage);

  res.status(201).json(newMessage);
});


// @desc    Lấy tin nhắn giữa người dùng hiện tại và một người dùng khác
// @route   GET /api/messages/:otherUserId
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { otherUserId } = req.params;
  const senderId = req.user._id;

  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, otherUserId] },
  }).populate("messages"); // Populate để lấy toàn bộ object messages

  if (!conversation) {
    return res.status(200).json([]); // Trả về mảng rỗng nếu chưa có tin nhắn
  }

  res.json(conversation.messages);
});


// @desc    Lấy danh sách các cuộc trò chuyện của người dùng
// @route   GET /api/conversations
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;

    const conversations = await Conversation.find({ participants: currentUserId })
        .populate({
            path: 'participants',
            select: 'username avatar',
            match: { _id: { $ne: currentUserId } } // Chỉ lấy thông tin của người kia
        })
        .populate({
            path: 'messages',
            options: { sort: { 'createdAt': -1 }, limit: 1 } // Chỉ lấy tin nhắn cuối cùng
        })
        .sort({ updatedAt: -1 });

    res.json(conversations);
});

// @desc    Tìm hoặc tạo một cuộc trò chuyện với người dùng khác
// @route   POST /api/conversations/findOrCreate
// @access  Private
const findOrCreateConversation = asyncHandler(async (req, res) => {
    const { receiverId } = req.body;
    const senderId = req.user._id;

    if (!receiverId) {
        res.status(400);
        throw new Error("Receiver ID is required.");
    }

    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
    }).populate({
        path: 'participants',
        select: 'username avatar'
    });

    if (!conversation) {
        conversation = await Conversation.create({ participants: [senderId, receiverId] });
        // Populate lại để có đủ thông tin
        conversation = await conversation.populate({
            path: 'participants',
            select: 'username avatar'
        });
    }
    
    res.status(200).json(conversation);
});

export { sendMessage, getMessages, getConversations, findOrCreateConversation };