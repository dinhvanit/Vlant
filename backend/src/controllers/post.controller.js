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

// @desc    Tạo một bài viết mới
// @route   POST /api/posts
// @access  Private (được bảo vệ bởi middleware 'protect')
const createPost = asyncHandler(async (req, res) => {
  const { content, imageUrl } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('Content is required to create a post.');
  }

  const post = await Post.create({
    content,
    imageUrl: imageUrl || '',
    author: req.user._id, // req.user được cung cấp bởi middleware 'protect'
  });
  
  // Trả về bài viết vừa tạo
  res.status(201).json(post);
});


export { getPosts, createPost };