import Conversation from "../models/Conversation.model.js";
// Biến để lưu trữ danh sách người dùng online
let onlineUsers = [];

// Hangf doi cho ghep cap
let anonymousQueue = [];

const addUser = (userId, socketId) => {
  // Chỉ thêm nếu user chưa tồn tại trong danh sách
  if (userId && !onlineUsers.some((user) => user.userId === userId)) {
    onlineUsers.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

const addUserToQueue = (userId, socketId) => {
  if (userId && !anonymousQueue.some((user) => user.userId === userId)) {
    anonymousQueue.push({ userId, socketId });
  }
};

const removeUserFromQueue = (socketId) => {
  anonymousQueue = anonymousQueue.filter((user) => user.socketId !== socketId);
};

// Hàm chính để khởi tạo và xử lý logic Socket.IO
const socketHandler = (io) => {
  setInterval(() => {
    io.emit("statsUpdate", {
      onlineCount: onlineUsers.length,
      queueCount: anonymousQueue.length,
    });
  }, 2000);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Lắng nghe sự kiện 'addUser' từ client
    socket.on("addUser", (userId) => {
      addUser(userId, socket.id);
      // Gửi lại danh sách user online cho tất cả client
      io.emit("getUsers", onlineUsers);
    });

    // Lắng nghe sự kiện ngắt kết nối
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      removeUser(socket.id);
      io.emit("getUsers", onlineUsers);
    });

    socket.on("sendMessage", ({ senderId, receiverId, content }) => {
      const receiver = getUser(receiverId);
      if (receiver) {
        // Gửi sự kiện 'newMessage' đến người nhận
        io.to(receiver.socketId).emit("newMessage", {
          senderId,
          content,
          createdAt: new Date().toISOString(), // Gửi kèm thời gian
        });
      }
    });

    // SỰ KIỆN MỚI: THAM GIA HÀNG ĐỢI GHÉP CẶP
    socket.on("joinAnonymousQueue", (userId) => {
      console.log(`User ${userId} joined anonymous queue.`);
      addUserToQueue(userId, socket.id);

      // KIỂM TRA VÀ THỰC HIỆN GHÉP CẶP
      if (anonymousQueue.length >= 2) {
        const user1 = anonymousQueue.shift(); // Lấy người đầu tiên
        const user2 = anonymousQueue.shift(); // Lấy người thứ hai

        console.log(`Matching ${user1.userId} and ${user2.userId}`);

        // Dùng async IIFE (Immediately Invoked Function Expression) để xử lý bất đồng bộ
        (async () => {
          try {
            // Tạo một cuộc trò chuyện mới trong DB
            const newConversation = await Conversation.create({
              participants: [user1.userId, user2.userId],
              // Có thể thêm cờ để đánh dấu đây là cuộc trò chuyện ẩn danh
              // isAnonymousMatch: true
            });

            // Gửi sự kiện 'matchFound' đến cả hai người dùng
            // Gửi kèm ID cuộc trò chuyện mới
            io.to(user1.socketId).emit("matchFound", {
              conversationId: newConversation._id,
            });
            io.to(user2.socketId).emit("matchFound", {
              conversationId: newConversation._id,
            });
          } catch (error) {
            console.error("Error creating anonymous conversation:", error);
            // Có thể emit một sự kiện lỗi về cho client nếu cần
          }
        })();
      }
    });

    // SỰ KIỆN MỚI: RỜI KHỎI HÀNG ĐỢI
    socket.on("leaveAnonymousQueue", () => {
      removeUserFromQueue(socket.id);
      console.log(`User ${socket.id} left anonymous queue.`);
    });

    // Cập nhật sự kiện 'disconnect' để xóa user khỏi hàng đợi nếu họ ngắt kết nối
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      removeUser(socket.id);
      removeUserFromQueue(socket.id); // <-- THÊM DÒNG NÀY
      io.emit("getUsers", onlineUsers);
    });
  });

  // Trả về một hàm tiện ích để có thể gửi sự kiện từ controller
  const sendNotification = (receiverId, notification) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit("getNotification", notification);
    }
  };

  const sendMessageRealtime = (receiverId, message) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit("newMessage", message);
    }
  };

  return { sendNotification, sendMessageRealtime };
};

export default socketHandler;
