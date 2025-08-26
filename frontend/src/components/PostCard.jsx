import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, MessageCircle, Eye, Star, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../utils/cn';

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(
    userInfo ? post.likes.includes(userInfo._id) : false
  );
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [isCaught, setIsCaught] = useState(false);
  const [showCatchEffect, setShowCatchEffect] = useState(false);

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "relative bg-card/80 backdrop-blur-sm border rounded-3xl transition-all duration-500 overflow-hidden",
        isCaught 
          ? "border-primary/80 shadow-lg shadow-primary/20" 
          : "border-border/50 hover:border-primary/30"
      )}
    >
      {/* Floating lantern effect */}
      <div className="absolute -top-2 -right-2 w-8 h-10 opacity-60">
        <div className="w-full h-full bg-gradient-to-b from-amber-400 to-orange-500 rounded-lg shadow-lg">
          <div className="w-full h-full bg-gradient-to-b from-yellow-300/20 to-transparent rounded-lg"></div>
        </div>
      </div>

      <div className="p-6 relative">
        {/* Anonymous/Named indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {post.isAnonymous ? (
              <>
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">Anonymous Wanderer</span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {post.author?.username?.[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium">{post.author?.username}</span>
              </>
            )}
          </div>
          
          {/* Catch lantern button */}
          {userInfo && !isCaught && (
            <motion.button
              onClick={handleCatchLantern}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <Star className="w-4 h-4 text-primary" />
            </motion.button>
          )}
        </div>

        {/* Post content */}
        <div className="relative">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-4 text-center italic">
            "{post.content}"
          </p>

          {/* Caught indicator */}
          {isCaught && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute top-2 right-2 bg-primary/20 backdrop-blur-sm rounded-full p-1"
            >
              <Star className="w-4 h-4 text-primary fill-current" />
            </motion.div>
          )}
        </div>

        {/* Image if exists */}
        {post.imageUrl && (
          <div className="my-4 rounded-xl overflow-hidden border border-border/50">
            <img
              src={post.imageUrl}
              alt="Post attachment"
              className="w-full h-auto max-h-[500px] object-cover"
            />
          </div>
        )}

        {/* Interaction area */}
        <div className="flex items-center justify-between text-muted-foreground pt-4 border-t border-border/30">
          <div className="flex items-center gap-6">
            {/* Like button */}
            <motion.button
              onClick={handleLikeClick}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "flex items-center gap-2 p-2 rounded-full transition-colors duration-200",
                isLikedByCurrentUser ? "text-red-500" : "hover:text-red-500"
              )}
            >
              <Heart 
                className={cn(
                  "w-5 h-5 transition-all",
                  isLikedByCurrentUser && "fill-current"
                )} 
              />
              <span className="text-sm font-medium">{likeCount}</span>
            </motion.button>

            {/* Comment button */}
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2 p-2 rounded-full transition-colors duration-200 hover:text-primary"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{post.commentCount || 0}</span>
            </motion.button>
          </div>
          
          <span className="text-xs">{formatTimeAgo(post.createdAt)}</span>
        </div>
      </div>

      {/* Catch effect animation */}
      <AnimatePresence>
        {showCatchEffect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 1.5,
                rotate: { repeat: Infinity, duration: 2 }
              }}
              className="text-6xl"
            >
              ✨
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PostCard;