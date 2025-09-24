import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { closePostModal } from "../features/ui/uiSlice";
import {
  fetchComments,
  addComment,
  clearComments,
} from "../features/posts/postSlice";

import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Switch } from "./ui/switch"
import { Label } from "./ui/label"
import { Heart, MessageCircle, Bookmark, Eye, Send, User} from "lucide-react";

import { cn } from "../utils/cn";


const PostDetailModal = () => {
  const dispatch = useDispatch();
  
  // Lấy state từ các slice khác nhau
  const { viewingPostId } = useSelector((state) => state.ui);
  const { posts, comments, commentsStatus } = useSelector((state) => state.posts);
  const { userInfo } = useSelector((state) => state.auth);

  // State cục bộ cho component
  const [post, setPost] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentAsAnonymous, setCommentAsAnonymous] = useState(true);
  
  // Logic để xác định trạng thái like/save của user hiện tại
  const isLikedByCurrentUser = post && userInfo ? post.likes.includes(userInfo._id) : false;
  // Giả sử có một trường `savedBy` trên user model, ta sẽ cập nhật sau
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch dữ liệu khi modal mở
  useEffect(() => {
    if (viewingPostId) {
      const currentPost = posts.find(p => p._id === viewingPostId);
      setPost(currentPost);
      dispatch(fetchComments(viewingPostId));
    }
  }, [viewingPostId, posts, dispatch]);

  const handleClose = () => {
    dispatch(closePostModal());
    dispatch(clearComments()); // Dọn dẹp state comments khi đóng
    setIsExpanded(false);
  };
  
  // Xử lý các hành động tương tác
  const handleLike = () => {
    if (!userInfo) return; // Mở modal đăng nhập nếu cần
    dispatch(likePost(post._id));
  };

  const handleBookmark = () => {
    if (!userInfo) return;
    setIsBookmarked(!isBookmarked); // Tạm thời chỉ thay đổi UI
    // dispatch(savePost(post._id));
  };
  
  const handleAddComment = () => {
    if (!newComment.trim() || !userInfo) return;
    dispatch(addComment({
      postId: post._id,
      content: newComment,
      isAnonymous: commentAsAnonymous,
    }));
    setNewComment("");
  };

  if (!viewingPostId) return null;

  return (
    <Dialog open={!!viewingPostId} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl w-full h-[90vh] max-h-[800px] p-0 flex flex-col">
        {/* Header ẩn cho accessibility */}
        <DialogHeader className="sr-only">
          <DialogTitle>{post?.title || "Lantern Detail"}</DialogTitle>
          <DialogDescription>Full content and comments for the selected lantern.</DialogDescription>
        </DialogHeader>

        {/* Khu vực nội dung bài viết (có thể cuộn) */}
        <div className="p-6 sm:p-8 flex-shrink-0 border-b border-border/50 overflow-y-auto">
          {!post ? (
            <Skeleton className="w-full h-64" />
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${post.isAnonymous ? "bg-muted" : "bg-primary/20"}`}>
                  {post.isAnonymous ? <Eye className="w-5 h-5" /> : <img src={post.authorAvatar} alt={post.authorUsername} className="w-full h-full object-cover rounded-full" />}
                </div>
                <div>
                  <p className="font-semibold">{post.isAnonymous ? "Anonymous Wanderer" : post.authorUsername}</p>
                  <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {post.title && <h1 className="text-2xl font-bold text-primary mb-4">{post.title}</h1>}
              
              <div className={`text-foreground/90 leading-relaxed whitespace-pre-wrap transition-all duration-300 ${post.content?.length > 300 && !isExpanded ? "max-h-32 overflow-hidden" : "max-h-full"}`}>
                {post.content}
              </div>
              {post.content?.length > 300 && (
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-primary font-semibold mt-2 text-sm">
                  {isExpanded ? "Show less" : "Show more..."}
                </button>
              )}

              <div className="flex items-center gap-6 text-muted-foreground border-t border-border/30 pt-4 mt-6">
                <button onClick={handleLike} className={cn("flex items-center gap-2", isLikedByCurrentUser && "text-red-500")}>
                  <Heart className={cn("w-5 h-5", isLikedByCurrentUser && "fill-current")} />
                  <span>{post.likeCount}</span>
                </button>
                <div className="flex items-center gap-2"><MessageCircle className="w-5 h-5" /><span>{post.commentCount}</span></div>
                <button onClick={handleBookmark} className={cn("flex items-center gap-2", isBookmarked && "text-primary")}>
                  <Bookmark className={cn("w-5 h-5", isBookmarked && "fill-current")} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Khu vực bình luận (có thể cuộn) */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto space-y-4">
          <h3 className="text-lg font-bold">Comments ({comments.length})</h3>
          {commentsStatus === 'loading' && <p>Loading comments...</p>}
          {commentsStatus === 'succeeded' && (
            comments.length > 0 ? comments.map(comment => (
              <div key={comment._id} className="flex gap-3 items-start">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${comment.isAnonymous ? 'bg-muted' : 'bg-primary/20'}`}>
                  {comment.isAnonymous ? <Eye className="w-5 h-5" /> : (comment.authorAvatar ? <img src={comment.authorAvatar} alt={comment.authorUsername} className="w-full h-full object-cover rounded-full"/> : <User className="w-5 h-5"/>)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{comment.authorUsername}</p>
                  <p className="text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            )) : <p className="text-muted-foreground text-sm">No comments yet. Be the first to share your thoughts!</p>
          )}
        </div>
        
        {/* Form viết bình luận */}
        {userInfo && userInfo.role !== 'guest' && (
          <div className="p-4 border-t border-border mt-auto">
            <div className="flex gap-2 mb-2">
              <Textarea placeholder="Add a comment..." className="resize-none" rows={1} value={newComment} onChange={(e) => setNewComment(e.target.value)}/>
              <Button onClick={handleAddComment} disabled={!newComment.trim()} className="h-auto aspect-square p-2"><Send className="w-5 h-5" /></Button>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="comment-anonymous-toggle" checked={commentAsAnonymous} onCheckedChange={setCommentAsAnonymous} />
              <Label htmlFor="comment-anonymous-toggle" className="text-sm">Comment anonymously</Label>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailModal;
