import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, MessageCircle } from 'lucide-react';
import { cn } from '../utils/cn';
// import { likePost } from '../features/posts/postSlice'; // Sẽ tạo thunk này sau

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  // State cục bộ để cập nhật UI ngay lập tức khi người dùng like
  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(
    userInfo ? post.likes.includes(userInfo._id) : false
  );
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);

  const handleLikeClick = () => {
    //Nếu là Guest, mở modal đăng nhập
    if (!userInfo) {
      dispatch(openAuthModal({ type: 'like', postId: post._id }));
      return;
    }

    // 2. Nếu đã đăng nhập, thực hiện logic like
    
    // Cập nhật giao diện ngay lập tức (Optimistic Update)
    if (isLikedByCurrentUser) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLikedByCurrentUser(!isLikedByCurrentUser);
    
    // Dispatch thunk để cập nhật lên server
    // dispatch(likePost(post._id));
  };
  
  // Hàm để định dạng thời gian cho dễ đọc (ví dụ)
  const formatTimeAgo = (dateString) => {
    // Trong dự án thật, bạn nên dùng thư viện như `date-fns` hoặc `moment`
    // Đây chỉ là một ví dụ đơn giản
    if (!dateString) return 'just now';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl transition-all duration-300 hover:border-primary/50">
      <div className="p-6">
        {/* Nội dung bài viết */}
        <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-4">
          {post.content}
        </p>

        {/* Hình ảnh (chỉ hiển thị nếu có) */}
        {post.imageUrl && (
          <div className="my-4 rounded-xl overflow-hidden border border-border/50">
            <img
              src={post.imageUrl}
              alt="Post attachment"
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Khu vực tương tác và thời gian */}
        <div className="flex items-center justify-between text-muted-foreground pt-4 border-t border-border/50">
          <div className="flex items-center gap-6">
            {/* Nút Like */}
            <button
              onClick={handleLikeClick}
              className={cn(
                "flex items-center gap-2 p-2 rounded-full transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card",
                isLikedByCurrentUser ? "text-red-500" : "hover:text-red-500"
              )}
              aria-label="Like post"
            >
              <Heart 
                className={cn(
                  "w-5 h-5 transition-all",
                  isLikedByCurrentUser && "fill-current"
                )} 
              />
              <span className="text-sm font-medium">{likeCount}</span>
            </button>

            {/* Nút Comment */}
            <button 
              className="flex items-center gap-2 p-2 rounded-full transition-colors duration-200 group hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card"
              aria-label="Comment on post"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.commentCount || 0}</span>
            </button>
          </div>
          
          {/* Thời gian đăng */}
          <span className="text-xs">{formatTimeAgo(post.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;