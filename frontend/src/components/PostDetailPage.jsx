import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog, DialogContent } from './ui/dialog';
import { closePostModal } from '../features/ui/uiSlice';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Heart, MessageCircle, Bookmark, Eye } from 'lucide-react';
import api from '../api/axios';

const PostDetailModal = () => {
  const dispatch = useDispatch();
  const { viewingPostId } = useSelector((state) => state.ui);
  const { posts } = useSelector((state) => state.posts);
  const { userInfo } = useSelector((state) => state.auth);

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const [newComment, setNewComment] = useState("");
  const [isAnonymousComment, setIsAnonymousComment] = useState(false);

  useEffect(() => {
    if (viewingPostId) {
      const existingPost = posts.find(p => p._id === viewingPostId);
      if (existingPost) {
        setPost(existingPost);
        setIsLiked(userInfo ? existingPost.likes.includes(userInfo._id) : false);
        setLikeCount(existingPost.likeCount || 0);
      }

      const fetchComments = async () => {
        setLoading(true);
        try {
          // demo data
          const data = [
            { _id: 'c1', authorUsername: 'Luna', content: 'This is a great thought!', createdAt: '2025-08-20' },
            { _id: 'c2', authorUsername: 'Anonymous Wanderer', content: 'I feel the same way sometimes.', createdAt: '2025-08-25' },
          ];
          setComments(data);
        } catch (error) {
          console.error("Failed to fetch comments", error);
        } finally {
          setLoading(false);
        }
      };
      fetchComments();
    }
  }, [viewingPostId, posts, userInfo]);

  const handleClose = () => {
    dispatch(closePostModal());
    setIsExpanded(false);
  };

  const handleLike = () => {
    if (!userInfo) return; // có thể mở modal đăng nhập ở đây
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleBookmark = () => {
    if (!userInfo) return;
    setIsBookmarked(!isBookmarked);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      _id: Date.now().toString(),
      authorUsername: isAnonymousComment ? "Anonymous Wanderer" : (userInfo?.username || "Guest"),
      content: newComment,
      createdAt: new Date().toISOString(),
    };

    setComments(prev => [comment, ...prev]);
    setNewComment("");
    setIsAnonymousComment(false);
  };

  if (!viewingPostId) return null;

  return (
    <Dialog open={!!viewingPostId} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <div className="p-6 flex-1 overflow-y-auto">
          {post ? (
            <>
              {/* Header: Avatar + tên + ngày */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${post.isAnonymous ? 'bg-muted' : 'bg-primary/20'}`}>
                  {!post.isAnonymous && post.authorAvatar ? (
                    <img src={post.authorAvatar} alt={post.authorUsername} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Eye className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="font-semibold">{post.isAnonymous ? "Anonymous Wanderer" : post.authorUsername}</p>
                  <p className="text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* Nội dung */}
              <div className="text-muted-foreground mb-4 whitespace-pre-line">
                <p className={isExpanded ? "" : "line-clamp-5"}>
                  {post.content}
                </p>
                {post.content?.length > 300 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-primary"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? "Ẩn bớt" : "Xem thêm"}
                  </Button>
                )}
              </div>

              {/* Ảnh */}
              {post.imageUrl && (
                <div className="rounded-xl overflow-hidden mb-6">
                  <img src={post.imageUrl} alt="post" className="w-full object-cover" />
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-6 text-muted-foreground border-t border-border/30 pt-4 mb-6">
                <button onClick={handleLike} className={`flex items-center gap-2 hover:text-red-500 ${isLiked ? "text-red-500" : ""}`}>
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{likeCount}</span>
                </button>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">{comments.length}</span>
                </div>
                <button onClick={handleBookmark} className={`flex items-center gap-2 hover:text-primary ${isBookmarked ? "text-primary" : ""}`}>
                  <Bookmark className="w-5 h-5" />
                </button>
              </div>

              {/* Comments */}
              <h3 className="text-lg font-bold mb-3">Comments</h3>
              {loading ? (
                <p>Loading comments...</p>
              ) : (
                <div className="space-y-4 mb-6">
                  {comments.map(comment => (
                    <div key={comment._id} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm">{comment.authorUsername}</p>
                        <p className="text-muted-foreground">{comment.content}</p>
                        <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Skeleton className="w-full h-96" />
          )}
        </div>

        {/* Form viết bình luận */}
        <div className="p-4 border-t border-border">
          <div className="flex flex-col gap-2">
            <Textarea
              placeholder="Add a comment..."
              className="resize-none"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={isAnonymousComment}
                  onChange={(e) => setIsAnonymousComment(e.target.checked)}
                />
                Comment anonymously
              </label>
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                <MessageCircle className="w-4 h-4 mr-1" /> Post
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDetailModal;
