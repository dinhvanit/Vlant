import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { openPostModal } from "../features/ui/uiSlice";
import { likePost } from '../features/posts/postSlice';
import { cn } from "../utils/cn";

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  // const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(
  //   userInfo ? post.likes.includes(userInfo._id) : false
  // );
  // const [likeCount, setLikeCount] = useState(post.likeCount || 0);

  const displayName = post.isAnonymous ? "Anonymous" : post.authorUsername;
  const displayAvatar = post.isAnonymous ? null : post.authorAvatar;

  const handleCardClick = (e) => {
    if (e.target.closest("button")) return;
    dispatch(openPostModal(post._id));
  };

  const handleLikeClick = (e) => {
    e.stopPropagation(); // Ngăn click lan ra card cha
    if (!userInfo || userInfo.role === 'guest') {
      dispatch(openAuthModal({ type: 'like', postId: post._id }));
      return;
    }
    
    // Dispatch action likePost với postId
    dispatch(likePost(post._id));
  };

  const isLikedByCurrentUser = userInfo ? post.likes.includes(userInfo._id) : false;
  const likeCount = post.likeCount || 0;

  const formatTime = (dateString) => {
    if (!dateString) return "just now";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      onClick={handleCardClick}
      whileHover={{ scale: 1.02 }}
      className="relative flex flex-col items-center cursor-pointer"
    >
      {/* Lantern Body - hình chữ nhật sáng */}
      <motion.div
        className={cn(
          "relative bg-gradient-to-br from-orange-500 to-red-600 text-white",
          "border-4 border-yellow-400 shadow-2xl mx-auto w-72 px-6 py-6",
          "flex flex-col rounded-2xl"
        )}
        animate={{ boxShadow: ["0 0 15px rgba(255,200,100,0.4)", "0 0 30px rgba(255,180,80,0.8)", "0 0 15px rgba(255,200,100,0.4)"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ minHeight: "340px" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              post.isAnonymous ? "bg-orange-900/50" : "bg-yellow-500/30"
            }`}
          >
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <Eye className="w-5 h-5 text-yellow-200" />
            )}
          </div>
          <div>
            <p className="font-semibold">{displayName}</p>
            <p className="text-xs text-yellow-200/80">{formatTime(post.createdAt)}</p>
          </div>
        </div>

        {/* Title & Content */}
        <div className="flex-1 relative z-10 text-center">
          {post.title && <h3 className="text-lg font-bold mb-2">{post.title}</h3>}
          <p className="text-sm text-yellow-100/90 line-clamp-4 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Image */}
        {post.imageUrl && (
          <div className="mt-4 relative z-10 rounded-lg overflow-hidden aspect-video">
            <img
              src={post.imageUrl}
              alt={post.title || "Post Image"}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-center gap-8 mt-6 relative z-10 text-yellow-200">
          <button
            onClick={handleLikeClick}
            className="flex items-center gap-1 hover:text-red-400"
          >
            <Heart
              className={`w-5 h-5 ${
                isLikedByCurrentUser ? "fill-pink-400 text-pink-400" : ""
              }`}
            />
            <span className="text-sm">{likeCount}</span>
          </button>

          <div className="flex items-center gap-1 hover:text-yellow-400">
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">{post.commentCount || 0}</span>
          </div>
        </div>
      </motion.div>

      {/* Tassel nhỏ đơn giản */}
      <motion.div
        className="w-1 h-10 bg-red-700 mt-2 rounded-full"
        animate={{ scaleY: [1, 1.15, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
};

export default PostCard;
