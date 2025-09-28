import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useSocket } from "../context/SocketContext";
import { Loader2, Users } from "lucide-react";
import { Button } from "../components/ui/button";

const MatchingPage = () => {
  const navigate = useNavigate();
  const socket = useSocket();
  const { userInfo } = useSelector((state) => state.auth);

  const [stats, setStats] = useState({ onlineCount: 0, queueCount: 0 });

  useEffect(() => {
    if (socket && userInfo) {
      // Gửi yêu cầu tìm kiếm
      socket.emit("find_match", userInfo._id);

      // Lắng nghe cập nhật thống kê
      socket.on("statsUpdate", (data) => setStats(data));
      // Lắng nghe khi tìm thấy cặp
      socket.on("match_found", ({ conversationId }) => {
        // Điều hướng đến trang chat ẩn danh mới
        navigate(`/anonymous-chat/${conversationId}`, { replace: true });
      });

      // Cleanup khi rời khỏi trang
      return () => {
        socket.emit("leave_match");
        socket.off("statsUpdate");
        socket.off("match_found");
      };
    }
  }, [socket, userInfo, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-background"
    >
      {/* Animation Lồng đèn đang bay lên */}
      <motion.div
        animate={{ y: [0, -40, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="text-8xl mb-8"
      >
        🏮
      </motion.div>
      <h1 className="text-3xl font-bold text-primary mb-4">
        Finding a Connection...
      </h1>
      <p className="text-lg text-muted-foreground max-w-md mb-8">
        Your lantern is drifting, seeking another light in the night sky.
      </p>
      <div className="flex items-center gap-6 text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" /> {stats.onlineCount} Wanderers online
        </div>
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> {stats.queueCount}{" "}
          Looking for a match
        </div>
      </div>
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="mt-12 rounded-full"
      >
        Cancel Search
      </Button>
    </motion.div>
  );
};

export default MatchingPage;
