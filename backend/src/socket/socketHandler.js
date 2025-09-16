// Biến để lưu trữ danh sách người dùng online
let onlineUsers = [];

const addUser = (userId, socketId) => {
  // Chỉ thêm nếu user chưa tồn tại trong danh sách
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


// Hàm chính để khởi tạo và xử lý logic Socket.IO
const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Lắng nghe sự kiện 'addUser' từ client
    socket.on('addUser', (userId) => {
      addUser(userId, socket.id);
      // Gửi lại danh sách user online cho tất cả client
      io.emit('getUsers', onlineUsers);
    });

    // Lắng nghe sự kiện ngắt kết nối
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      removeUser(socket.id);
      io.emit('getUsers', onlineUsers);
    });
    
    // Bạn có thể thêm các event listener khác ở đây
    // Ví dụ:
    // socket.on('sendMessage', ({ senderId, receiverId, text }) => {
    //   const user = getUser(receiverId);
    //   if (user) {
    //     io.to(user.socketId).emit('getMessage', { senderId, text });
    //   }
    // });
  });
  
  // Trả về một hàm tiện ích để có thể gửi sự kiện từ controller
  const sendNotification = (receiverId, notification) => {
    const user = getUser(receiverId);
    if (user) {
      io.to(user.socketId).emit('getNotification', notification);
    }
  };

  return { sendNotification };
};

export default socketHandler;