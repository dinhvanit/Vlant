import asyncHandler from 'express-async-handler';
import Post from '../models/Post.model.js';
import User from '../models/User.model.js'; 

/**
 * @desc    Helper function to format post data before sending to client.
 *          It ensures anonymity for anonymous posts and provides consistent structure.
 * @param   {Array | Object} posts - A single post object or an array of post objects.
 * @returns {Array | Object} The formatted post(s).
 */
const formatPosts = (posts) => {
  const formatSinglePost = (post) => {
    // Chuyển Mongoose document thành plain JavaScript object
    const postObject = post.toObject({ virtuals: true });

    // Lấy thông tin author nếu nó được populate (tức là isAnonymous = false)
    const authorInfo = post.author;
    
    return {
      _id: postObject._id,
      title: postObject.title,
      content: postObject.content,
      imageUrl: postObject.imageUrl,
      isAnonymous: postObject.isAnonymous,
      likes: postObject.likes,
      likeCount: postObject.likeCount,
      commentCount: postObject.commentCount,
      createdAt: postObject.createdAt,
      updatedAt: postObject.updatedAt,
      // Luôn trả về author ID dưới dạng chuỗi để client có thể phân biệt
      // các bài viết ẩn danh của cùng một người mà không lộ danh tính
      authorId: authorInfo?._id.toString(), 
      // Chỉ trả về username và avatar nếu bài viết không ẩn danh
      authorUsername: postObject.isAnonymous ? undefined : authorInfo?.username,
      authorAvatar: postObject.isAnonymous ? undefined : authorInfo?.avatar,
    };
  };

  if (Array.isArray(posts)) {
    return posts.map(formatSinglePost);
  }
  return formatSinglePost(posts);
};


// @desc    Lấy tất cả bài viết
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({})
    .sort({ createdAt: -1 })
    .populate({ 
      path: 'author',
      select: 'username avatar', // Chỉ lấy 2 trường này
    });

  // Sử dụng helper function để chuẩn hóa dữ liệu trước khi gửi đi
  const formattedPosts = formatPosts(posts);

  res.status(200).json(formattedPosts);
});


// @desc    Tạo một bài viết mới
// @route   POST /api/posts
// @access  Private (được bảo vệ bởi middleware 'protect')
const createPost = asyncHandler(async (req, res) => {
  console.log('--- RUNNING THE CORRECT createPost. BODY:', req.body);
  const { title, content, imageUrl, isAnonymous } = req.body;

  if (!content) {
    res.status(400);
    throw new Error('Content is required to create a post.');
  }

  const post = await Post.create({
    title,
    content,
    imageUrl: imageUrl || '',
    author: req.user._id, // req.user được cung cấp bởi middleware 'protect'
    // isAnonymous sẽ là true nếu client gửi true, ngược lại là false.
    // Nếu client không gửi gì, nó sẽ là undefined (falsy) -> false
    isAnonymous: !!isAnonymous,
  });

  // Populate thông tin author cho bài viết vừa tạo để trả về client
  // ngay lập tức với định dạng chuẩn
  const newPost = await Post.findById(post._id).populate({
    path: 'author',
    select: 'username avatar',
  });

  res.status(201).json(formatPosts(newPost));
});


// Export các hàm
export { getPosts, createPost };