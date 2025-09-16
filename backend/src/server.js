import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import http from 'http'; // Import module 'http' của Node.js
import { Server } from 'socket.io';

// Import các module tự viết
import connectDB from './config/db.js';
import mainRouter from './routes/index.js'; 
import { notFound, errorHandler } from './middleware/error.middleware.js';
import socketHandler from './socket/socketHandler.js'; // Import trình xử lý socket

// Tải biến môi trường
dotenv.config();

// Kết nối đến Database
connectDB();

// Khởi tạo Express app
const app = express();

// Tạo HTTP server từ Express app
const httpServer = http.createServer(app);

// Khởi tạo Socket.IO server và gắn nó vào HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000', // Cho phép kết nối từ frontend
    credentials: true,
  }
});

// --- Middlewares ---
// Sử dụng CORS một lần duy nhất với cấu hình đúng
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json()); // Để parse JSON body
app.use(express.urlencoded({ extended: true })); // Để parse form data
app.use(cookieParser()); // Để parse cookies
app.use(morgan('dev')); // Để log các request HTTP

// --- Xử lý Socket.IO ---
// Gọi hàm xử lý socket và lấy ra các hàm tiện ích
const { sendNotification } = socketHandler(io);

// Gán hàm tiện ích vào app.locals để các controller có thể truy cập
// thông qua req.app.locals.sendNotification
app.locals.sendNotification = sendNotification;


// --- Routes ---
app.use('/api', mainRouter);

// Route mặc định để kiểm tra API có đang chạy không
app.get('/', (req, res) => {
  res.send('Vlant API is running... 🏮');
});


// --- Error Handling Middlewares ---
// Phải đặt sau tất cả các routes
app.use(notFound);
app.use(errorHandler);


// --- Khởi chạy Server ---
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => 
  console.log(`Server is running with Socket.IO on port ${PORT}`)
);