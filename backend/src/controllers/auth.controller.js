import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler'; // Helper để không cần try-catch block

// Hàm tạo token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token hết hạn sau 30 ngày
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  // Kiểm tra user đã tồn tại chưa
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Tạo user
  const user = await User.create({
    username,
    email,
    password,
  });

  if (user) {
    const token = generateToken(user._id);

    // Gửi token qua cookie
    res.cookie('jwt', token, {
      httpOnly: true, // Ngăn JS ở client truy cập
      secure: process.env.NODE_ENV !== 'development', // Chỉ gửi qua HTTPS ở môi trường production
      sameSite: 'strict', // Chống tấn công CSRF
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate a user (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Tìm user và lấy cả password
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.comparePassword(password))) {
    const token = generateToken(user._id);

    // Gửi token qua cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private (vì chỉ người đăng nhập mới cần logout)
const logoutUser = asyncHandler(async (req, res) => {
  // Xóa cookie bằng cách ghi đè nó với một cookie hết hạn
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0), // Đặt thời gian hết hạn trong quá khứ
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

export { registerUser, loginUser, logoutUser };