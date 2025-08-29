import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, MessageCircle, Eye, Star, Sparkles, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';
import { openPostModal } from '../features/ui/uiSlice';

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(
    userInfo ? post.likes.includes(userInfo._id) : false
  );
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [isCaught, setIsCaught] = useState(false);
  const [showCatchEffect, setShowCatchEffect] = useState(false);

  const displayName = post.isAnonymous 
    ? "Anonymous Wanderer" 
    : post.authorUsername;
  
  const displayAvatar = post.isAnonymous ? null : post.authorAvatar;


  

  // Hiệu ứng "bắt" đèn lồng
  const handleCatchLantern = () => {
    if (!userInfo || isCaught) return;
    
    setIsCaught(true);
    setShowCatchEffect(true);
    
    // Tạo hiệu ứng sparkle
    setTimeout(() => setShowCatchEffect(false), 1500);
    
    // Dispatch action để lưu lantern đã bắt
    // dispatch(catchLantern(post._id));
  };

  const handleCardClick = (e) => {
    if (e.target.closest('button')) {
      return;
    }
    dispatch(openPostModal(post._id));
  };

  const handleLikeClick = () => {
    if (!userInfo) {
      dispatch(openAuthModal({ type: 'like', postId: post._id }));
      return;
    }

    if (isLikedByCurrentUser) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLikedByCurrentUser(!isLikedByCurrentUser);
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'just now';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <motion.div
      onClick={handleCardClick}
      className={cn(
        "relative bg-card/80 backdrop-blur-sm border rounded-3xl transition-all duration-300 overflow-hidden cursor-pointer",
        "border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10"
      )}
      layout // Thêm prop này để có animation đẹp khi re-order
    >
      <div className="p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${post.isAnonymous ? 'bg-muted' : 'bg-primary/20'}`}>
              {displayAvatar ? (
                <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover rounded-full" />
              ) : (
                <Eye className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Tiêu đề và Nội dung (preview) */}
        <div className="space-y-2">
          {post.title && (
            <h3 className="text-lg font-bold text-foreground truncate">{post.title}</h3>
          )}
          <p className="text-muted-foreground leading-relaxed line-clamp-3">
            {post.content}
          </p>
        </div>
        
        {/* Ảnh (nếu có) */}
        {post.imageUrl && (
            <div className="mt-4 rounded-xl overflow-hidden aspect-video">
                <img src={post.imageUrl} alt={post.title || 'Post Image'} className="w-full h-full object-cover"/>
            </div>
        )}

        {/* Footer: Tương tác */}
        <div className="flex items-center justify-end gap-6 text-muted-foreground pt-4 mt-4 border-t border-border/30">
          <button onClick={handleLikeClick} className="flex items-center gap-2 transition-colors hover:text-red-500">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium">{post.likeCount || 0}</span>
          </button>
          <button className="flex items-center gap-2 transition-colors hover:text-primary">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{post.commentCount || 0}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;