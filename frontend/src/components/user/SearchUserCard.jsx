import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

/**
 * Component để hiển thị một người dùng trong kết quả tìm kiếm chat.
 * @param {object} user - Thông tin người dùng.
 * @param {function} onSelect - Hàm callback được gọi khi người dùng click vào card.
 */
const SearchUserCard = ({ user, onSelect }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={() => onSelect(user)} // <-- Kích hoạt hành động khi click
      className="flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:bg-secondary"
    >
      <Avatar className="w-10 h-10">
        <AvatarImage src={user.avatar} alt={user.username} />
        <AvatarFallback>{user.username?.[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-semibold truncate">{user.username}</p>
        <p className="text-sm text-muted-foreground truncate">{user.bio || "..."}</p>
      </div>
    </motion.div>
  );
};

export default SearchUserCard;