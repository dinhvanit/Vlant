import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { UserPlus, Clock } from "lucide-react";
import { sendFriendRequest } from "../../features/users/userSlice";

const UserCard = ({ user }) => {
  const dispatch = useDispatch();
  const [requestSent, setRequestSent] = useState(false);

  const handleAddFriend = () => {
    // Ngăn việc gửi lại request nếu đã gửi
    if (requestSent) return;

    dispatch(sendFriendRequest({ userId: user._id, username: user.username }));
    setRequestSent(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border"
    >
      <Link
        to={`/profile/${user.username}`}
        className="flex items-center gap-4 min-w-0"
      >
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.avatar} alt={user.username} />
          <AvatarFallback>{user.username?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold truncate">{user.username}</p>
          <p className="text-sm text-muted-foreground truncate">
            {user.bio || "A mysterious wanderer..."}
          </p>
        </div>
      </Link>
      <Button
        size="sm"
        className="rounded-full shrink-0"
        onClick={handleAddFriend}
        disabled={requestSent}
        variant={requestSent ? "outline" : "default"}
      >
        {requestSent ? (
          <>
            <Clock className="w-4 h-4 mr-2" /> Sent
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" /> Add
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default UserCard;
