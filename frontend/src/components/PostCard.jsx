import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { fetchPosts } from '../features/posts/postSlice';
import PostCard from './PostCard';
import { Skeleton } from './ui/skeleton'; // Component skeleton từ shadcn/ui

const PostFeed = () => {
  // Test giao diện bằng dữ liệu giả
  // Sau này bạn sẽ thay thế bằng useSelector
  const posts = [
    { _id: '1', content: 'Sometimes the smallest step in the right direction ends up being the biggest step of your life.', imageUrl: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800', likes: 128, comments: 12, createdAt: '2 hours ago' },
    { _id: '2', content: 'Just a random thought floating in the night. What if we are all just stories in the end? Let\'s make it a good one, eh?', likes: 97, comments: 5, createdAt: '5 hours ago' },
    { _id: '3', content: 'Tonight\'s sky is so clear. Makes you feel both incredibly small and infinitely hopeful at the same time.', imageUrl: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d42e2?w=800', likes: 256, comments: 24, createdAt: '8 hours ago' },
  ];
  const loading = false; // Thay đổi thành true để xem hiệu ứng skeleton
  const error = null; // Gán một chuỗi để xem thông báo lỗi

  // const dispatch = useDispatch();
  // const { posts, loading, error } = useSelector((state) => state.posts);

  // useEffect(() => {
  //   dispatch(fetchPosts());
  // }, [dispatch]);

  // Hiển thị skeleton khi đang tải
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  // Hiển thị lỗi
  if (error) {
    return <div className="text-center text-destructive">Error: {error}</div>;
  }

  // Hiển thị khi không có bài viết
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center text-muted-foreground mt-20">
        <h2 className="text-xl font-semibold">The sky is quiet tonight...</h2>
        <p>Be the first to release a lantern and share your thoughts.</p>
      </div>
    );
  }

  // Hiển thị danh sách bài viết
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};

export default PostFeed;