import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Tham chiếu đến User model
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required.'],
      trim: true,
      maxlength: [2000, 'Post content cannot be more than 2000 characters.'],
    },
    imageUrl: {
      type: String,
      default: '',
    },
    // Chúng ta sẽ lưu danh sách những người đã like
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Tạm thời để trống, sẽ phát triển sau
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
    toJSON: { virtuals: true }, // Bật virtuals để tính toán các trường ảo
    toObject: { virtuals: true },
  }
);

// Tạo một trường ảo 'likeCount' để dễ dàng lấy số lượt thích
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Tạo một trường ảo 'commentCount'
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});


const Post = mongoose.model('Post', postSchema);

export default Post;