import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPosts } from '../features/posts/postSlice'; // Import thunk
import PostCard from './PostCard';
import { Skeleton } from './ui/skeleton';

const PostFeed = () => {
  const dispatch = useDispatch();
  
  // Lấy state từ postSlice trong Redux store
  const { posts, loading, error } = useSelector((state) => state.posts);

  // Gọi API để lấy bài viết khi component được render lần đầu
  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]); // Dependency array [dispatch] đảm bảo nó chỉ chạy 1 lần

  // 1. Hiển thị skeleton khi đang tải
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Skeleton cho một PostCard */}
        <div className="bg-card/50 p-6 rounded-2xl space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-64 w-full rounded-xl mt-4" />
        </div>
        {/* Skeleton thứ hai */}
        <div className="bg-card/50 p-6 rounded-2xl space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  // 2. Hiển thị lỗi nếu có
  if (error) {
    return (
        <div className="text-center text-destructive mt-20">
            <h2 className="text-xl font-semibold">Oops! Something went wrong.</h2>
            <p>Could not load the lanterns. Please try again later.</p>
            <p className="text-sm mt-2">Error: {error}</p>
        </div>
    );
  }

  // 3. Hiển thị khi không có bài viết
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-20">
        <h2 className="text-xl font-semibold">The sky is quiet tonight...</h2>
        <p>Be the first to release a lantern and share your thoughts.</p>
      </div>
    );
  }

  // 4. Hiển thị danh sách bài viết từ API
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default PostFeed;