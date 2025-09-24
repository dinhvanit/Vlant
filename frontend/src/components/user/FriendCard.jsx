import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { motion } from 'framer-motion';

const FriendCard = ({ friend, index }) => {
  return (
    // Thêm animation xuất hiện cho từng card
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: (index || 0) * 0.05 }}
    >
      <Link 
        to={`/profile/${friend.username}`}
        className="flex flex-col items-center text-center gap-2 p-4 rounded-2xl hover:bg-accent cursor-pointer transition-colors"
      >
        <Avatar className="w-20 h-20 border-2 border-border">
          <AvatarImage src={friend.avatar} alt={friend.username} />
          <AvatarFallback>{friend.username?.[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate w-full">{friend.username}</p>
          <p className="text-xs text-muted-foreground truncate">{friend.bio}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default FriendCard;