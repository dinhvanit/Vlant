import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { fetchPosts } from "../features/posts/postSlice";
import PostCard from "./PostCard";
import PostDetailModal from "./PostDetailPage";
import { Skeleton } from "./ui/skeleton";
import { Button } from "./ui/button";
import { Moon, Star, Sparkles, Wind } from "lucide-react";


const PostFeed = () => {
  const dispatch = useDispatch();
  const [visiblePosts, setVisiblePosts] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { posts, status, error } = useSelector((state) => state.posts);

  useEffect(() => {
    // Chỉ fetch dữ liệu nếu trạng thái là 'idle' (chưa fetch lần nào)
    if (status === 'idle') {
      dispatch(fetchPosts());
    }
  }, [status, dispatch]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisiblePosts((prev) => prev + 6);
      setIsLoadingMore(false);
    }, 1000);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="max-w-md mx-auto">
      {/* Lantern top */}
      <Skeleton className="h-8 w-2/3 mx-auto mb-2 rounded-lg" />

      {/* Main lantern body */}
      <div
        className="bg-card/50 p-6 rounded-none border-2 border-border/30 min-h-80"
        style={{ clipPath: "polygon(8% 0%, 92% 0%, 88% 100%, 12% 100%)" }}
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-3/4 mx-auto" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%] mx-auto" />
            <Skeleton className="h-4 w-[80%] mx-auto" />
          </div>
          <div className="flex justify-between items-center pt-4">
            <div className="flex gap-4">
              <Skeleton className="h-8 w-12 rounded-full" />
              <Skeleton className="h-8 w-12 rounded-full" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>

      {/* Lantern bottom */}
      <Skeleton className="h-8 w-2/3 mx-auto mt-2 rounded-lg" />
      <Skeleton className="h-6 w-2 mx-auto mt-2" />
    </div>
  );

  // Trạng thái Loading ban đầu
  if (status === 'loading') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  // Trạng thái Lỗi
  if (status === 'failed') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
        <div className="max-w-md mx-auto bg-card/80 p-8 rounded-3xl">
          <Wind className="w-8 h-8 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-destructive mb-2">The wind scattered the lanterns...</h2>
          <p className="text-muted-foreground mb-4">Could not load the floating thoughts.</p>
          <Button onClick={() => dispatch(fetchPosts())}>Try Again</Button>
        </div>
      </motion.div>
    );
  }
  
  return (
    <div className="container mx-auto">
      {/* Trạng thái Rỗng */}
      {posts.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-muted-foreground">
          <h2 className="text-xl font-semibold">The sky is quiet tonight...</h2>
          <p>Be the first to release a lantern and share your thoughts.</p>
        </motion.div>
      ) : (
        // Danh sách bài viết
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {posts.slice(0, visiblePosts).map((post, index) => (
                <motion.div
                  key={post._id}
                  layout
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -30, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                >
                  <PostCard post={post} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Nút "Load More" */}
          {posts.length > visiblePosts && (
            <div className="text-center py-12">
              <Button onClick={handleLoadMore} disabled={isLoadingMore} size="lg" className="rounded-full px-8">
                {isLoadingMore ? "Gathering more lanterns..." : "Show More Lanterns"}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modal chi tiết bài viết sẽ được kích hoạt từ Redux state */}
      <PostDetailModal />
    </div>
  );
};

export default PostFeed;