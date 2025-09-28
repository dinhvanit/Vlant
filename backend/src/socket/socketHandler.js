import Conversation from '../models/Conversation.model.js';
import Message from '../models/Message.model.js';
import User from '../models/User.model.js';

// --- Biến cục bộ để quản lý trạng thái real-time ---
let onlineUsers = [];
let anonymousQueue = [];

// --- Các hàm helper ---
const addUser = (userId, socketId) => {
  if (userId && !onlineUsers.some(user => user.userId === userId)) {
    onlineUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter(user => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find(user => user.userId === userId);
};

const addUserToQueue = (userId, socketId) => {
  if (userId && !anonymousQueue.some(user => user.userId === userId)) {
    anonymousQueue.push({ userId, socketId });
  }
};

const removeUserFromQueue = (socketId) => {
  anonymousQueue = anonymousQueue.filter(user => user.socketId !== socketId);
};


// --- Hàm xử lý chính ---
const socketHandler = (io) => {
  
  // Gửi cập nhật thống kê định kỳ
  setInterval(() => {
    io.emit('statsUpdate', {
      onlineCount: onlineUsers.length,
      queueCount: anonymousQueue.length,
    });
  }, 2000);

  // Xử lý khi có một client mới kết nối
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // === QUẢN LÝ KẾT NỐI ===
    socket.on('addUser', (userId) => {
      addUser(userId, socket.id);
      io.emit('getUsers', onlineUsers);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      removeUser(socket.id);
      removeUserFromQueue(socket.id); // Quan trọng: xóa khỏi hàng đợi khi disconnect
      io.emit('getUsers', onlineUsers);
    });
    
    // === LOGIC GHÉP CẶP ẨN DANH ===
    socket.on('find_match', (userId) => {
      addUserToQueue(userId, socket.id);

      if (anonymousQueue.length >= 2) {
        const user1 = anonymousQueue.shift();
        const user2 = anonymousQueue.shift();
        
        (async () => {
          try {
            const conversation = await Conversation.create({
              participants: [user1.userId, user2.userId],
              isAnonymousMatch: true,
            });

            io.to(user1.socketId).emit('match_found', { conversationId: conversation._id });
            io.to(user2.socketId).emit('match_found', { conversationId: conversation._id });
          } catch (error) { console.error("Error in matching:", error); }
        })();
      }
    });

    socket.on('leave_match', () => {
      removeUserFromQueue(socket.id);
    });

    // === LOGIC CHAT (DÙNG CHUNG) ===
    socket.on('join_chat_room', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });
    
    socket.on('send_message', async ({ conversationId, senderId, content }) => {
        try {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) return;

            const receiverId = conversation.participants.find(p => p.toString() !== senderId);
            if (!receiverId) return;

            const newMessage = new Message({ senderId, receiverId, content });
            
            conversation.messages.push(newMessage._id);
            await Promise.all([conversation.save(), newMessage.save()]);

            // Gửi tin nhắn đến tất cả client trong phòng đó (bao gồm cả người gửi để xác nhận)
            io.to(conversationId).emit('new_message', newMessage.toObject());
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });
  });
  
  // Hàm tiện ích để controller có thể gửi thông báo
  const sendNotification = (receiverId, notification) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit('new_notification', notification);
    }
  };

  // Trả về các hàm mà controller cần
  return { sendNotification };
};

export default socketHandler;