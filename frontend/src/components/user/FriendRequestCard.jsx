import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Check, X } from "lucide-react";
import {
  handleFriendRequest,
  removeRequest,
} from "../../features/users/userSlice";

const FriendRequestCard = ({ request }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAccept = () => {
    dispatch(handleFriendRequest({ senderId: request._id, action: "accept" }));
    // Xóa request khỏi UI ngay lập tức để người dùng thấy phản hồi
    dispatch(removeRequest(request._id));
    // Điều hướng đến profile của bạn mới để xem
    navigate(`/profile/${request.username}`);
  };

  const handleDecline = () => {
    dispatch(handleFriendRequest({ senderId: request._id, action: "decline" }));
    dispatch(removeRequest(request._id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="p-4 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-between"
    >
      <Link
        to={`/profile/${request.username}`}
        className="flex items-center gap-4 min-w-0"
      >
        <Avatar className="w-12 h-12">
          <AvatarImage src={request.avatar} alt={request.username} />
          <AvatarFallback>{request.username?.[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="font-semibold truncate">{request.username}</p>
          <p className="text-sm text-muted-foreground">
            Sent you a friend request
          </p>
        </div>
      </Link>
      <div className="flex gap-2">
        <Button
          onClick={handleAccept}
          size="icon"
          className="rounded-full bg-green-600 hover:bg-green-700"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          onClick={handleDecline}
          size="icon"
          variant="destructive"
          className="rounded-full"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default FriendRequestCard;
