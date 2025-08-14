import asyncHandler from 'express-async-handler';
import Post from '../models/Post.model.js';

// @desc    Lấy tất cả bài viết
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  // Lấy bài viết, sắp xếp theo thứ tự mới nhất trước
  const posts = await Post.find({}).sort({ createdAt: -1 });

  // Quan trọng: Chúng ta không gửi về 'author'
  res.status(200).json(posts);
});

export { getPosts };