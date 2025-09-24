import asyncHandler from 'express-async-handler';
import Post from '../models/Post.model.js';
import User from '../models/User.model.js';
import Comment from '../models/Comment.model.js';
import Notification from '../models/Notification.model.js';

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


// @desc    Like hoặc Unlike một bài viết
// @route   PUT /api/posts/:id/like
// @access  Private
const likePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const userId = req.user._id;

  const hasLiked = post.likes.includes(userId);

  if (hasLiked) {
    post.likes.pull(userId);
  } else {
    post.likes.push(userId);
  }

  if (post.author.toString() !== userId.toString()) {
      const notification = await Notification.create({
        recipient: post.author,
        sender: userId,
        type: 'like',
        post: post._id,
      });
      await notification.populate('sender', 'username avatar');
      
      const sendNotification = req.app.locals.sendNotification;
      sendNotification(post.author.toString(), notification);
    }

  // Lưu lại thay đổi vào database
  await post.save();
  
  // Trả về bài viết đã được cập nhật
  const updatedPost = await Post.findById(post._id).populate('author', 'username avatar');
  res.status(200).json(formatPosts(updatedPost));
});

// @desc    Thêm một bình luận mới vào bài viết
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { content, isAnonymous } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const comment = await Comment.create({
    content,
    isAnonymous: !!isAnonymous,
    post: req.params.id,
    author: req.user._id,
  });

  post.comments.push(comment._id);
  await post.save();

  // --- LOGIC TẠO THÔNG BÁO TỐI ƯU ---
  if (post.author.toString() !== req.user._id.toString()) {
      const notification = await Notification.create({
          recipient: post.author,
          sender: req.user._id,
          type: 'comment',
          post: post._id,
          // lưu trực tiếp trạng thái ẩn danh của cmt
          isActionAnonymous: !!isAnonymous, 
      });

      // Populate và gửi đi
      const populatedNotif = await Notification.findById(notification._id)
          .populate('sender', 'username avatar');
      
      const sendNotification = req.app.locals.sendNotification;
      sendNotification(post.author.toString(), populatedNotif);
  }
  
  // Trả về comment vừa tạo
  const newComment = await Comment.findById(comment._id).populate('author', 'username avatar');
  res.status(201).json(newComment);
});

// @desc    Lấy tất cả bình luận của một bài viết
// @route   GET /api/posts/:id/comments
// @access  Public
const getCommentsForPost = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.id })
    .sort({ createdAt: -1 })
    .populate('author', 'username avatar');
  
  const formattedComments = comments.map(c => {
    const commentObject = c.toObject();
    return {
      _id: commentObject._id,
      content: commentObject.content,
      isAnonymous: commentObject.isAnonymous,
      createdAt: commentObject.createdAt,
      authorId: commentObject.author._id,
      authorUsername: c.isAnonymous ? `Wanderer #${c.author._id.toString().slice(-4)}` : c.author.username,
      authorAvatar: c.isAnonymous ? null : c.author.avatar,
    };
  });
  
  res.status(200).json(formattedComments);
});

// Export các hàm
export { getPosts, createPost, likePost, addComment, getCommentsForPost};