import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchPosts } from '../features/posts/postSlice';
import PostCard from './PostCard'; // Import PostCard đã cải thiện
import { Skeleton } from './ui/skeleton';
import { Moon, Star, Sparkles, Wind } from 'lucide-react';

const PostFeed = () => {
  const dispatch = useDispatch();
  const { posts, loading, error } = useSelector((state) => state.posts);
  const [visiblePosts, setVisiblePosts] = useState(6); // Hiển thị 6 bài đầu tiên
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisiblePosts(prev => prev + 6);
      setIsLoadingMore(false);
    }, 1000);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="max-w-md mx-auto">
      {/* Lantern top */}
      <Skeleton className="h-8 w-2/3 mx-auto mb-2 rounded-lg" />
      
      {/* Main lantern body */}
      <div className="bg-card/50 p-6 rounded-none border-2 border-border/30 min-h-80"
           style={{ clipPath: 'polygon(8% 0%, 92% 0%, 88% 100%, 12% 100%)' }}>
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

  // Loading state
  if (loading) {
    return (
      <div className="space-y-12">
        {/* Header với hiệu ứng loading */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Moon className="w-8 h-8 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold text-primary">Loading Lanterns...</h2>
          </div>
          <p className="text-muted-foreground">Gathering floating thoughts from the night sky</p>
        </motion.div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <LoadingSkeleton />
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16"
      >
        <div className="max-w-md mx-auto bg-card/80 backdrop-blur-sm border border-destructive/30 rounded-3xl p-8">
          <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wind className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-destructive mb-2">
            The wind scattered the lanterns...
          </h2>
          <p className="text-muted-foreground mb-4">
            Could not load the floating thoughts. The night sky seems quiet.
          </p>
          <p className="text-sm text-destructive/80">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => dispatch(fetchPosts())}
            className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            Try Again
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Empty state
  if (!posts || posts.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="max-w-lg mx-auto">
          <div className="relative mb-8">
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0, -5, 0] 
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto"
            >
              <Moon className="w-12 h-12 text-primary" />
            </motion.div>
            
            {/* Floating stars around */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-primary/40"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`
                }}
                animate={{
                  y: [0, -5, 0],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 2 + Math.random(),
                  repeat: Infinity,
                  delay: i * 0.3
                }}
              >
                <Star className="w-3 h-3" />
              </motion.div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-4">
            The night sky is quiet...
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            No lanterns are floating tonight. Be the first to release your thoughts 
            into the darkness and light up someone's world.
          </p>
          
          <motion.div 
            className="mt-8 p-4 bg-primary/10 rounded-2xl border border-primary/20"
            animate={{
              boxShadow: ["0 0 0 0 rgba(255,140,66,0)", "0 0 0 4px rgba(255,140,66,0.1)", "0 0 0 0 rgba(255,140,66,0)"]
            }}
            transition={{
              duration: 2,
              repeat: Infinity
            }}
          >
            <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-sm text-primary font-medium">
              Click the "Create Lantern" button to share your story
            </p>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Main feed display
  return (
    <div className="space-y-8">
      {/* Feed Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6"
      >
        <div className="inline-flex items-center gap-3 mb-2">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "linear"
            }}
          >
            <Moon className="w-6 h-6 text-primary" />
          </motion.div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-yellow-300 bg-clip-text text-transparent">
            Floating Lanterns
          </h2>
        </div>
        <p className="text-muted-foreground text-sm">
          {posts.length} thoughts drifting in the night sky
        </p>
      </motion.div>

      {/* Posts Grid */}
      <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {posts.slice(0, visiblePosts).map((post, index) => (
            <motion.div
              key={post._id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                  delay: (index % 6) * 0.1,
                  duration: 0.6,
                  ease: "easeOut"
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.8, 
                transition: { duration: 0.3 } 
              }}
            >
              <PostCard post={post} index={index} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Load More Button */}
      {posts.length > visiblePosts && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <motion.button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            whileHover={{ scale: isLoadingMore ? 1 : 1.05 }}
            whileTap={{ scale: isLoadingMore ? 1 : 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-primary/80 to-orange-500/80 hover:from-primary hover:to-orange-500 text-primary-foreground rounded-full font-semibold transition-all duration-300 shadow-lg shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-2">
              {isLoadingMore ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </motion.div>
                  <span>Gathering more lanterns...</span>
                </>
              ) : (
                <>
                  <Wind className="w-5 h-5" />
                  <span>Release more into the night</span>
                </>
              )}
            </div>
          </motion.button>
        </motion.div>
      )}

      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`ambient-${i}`}
            className="absolute w-px h-px bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 2, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default PostFeed;