import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useSocket } from "../context/SocketContext";
import {
  fetchConversations,
  fetchMessages,
  addMessage,
  addOrUpdateConversation,
} from "../features/chat/chatSlice";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Send, Search } from "lucide-react";
import { cn } from "../utils/cn";
import api from "../api/axios";
import { Skeleton } from "../components/ui/skeleton";
import SearchUserCard from "../components/user/SearchUserCard";

const MessengerPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const socket = useSocket();
  const { userInfo } = useSelector((state) => state.auth);
  const { conversations, conversationsStatus, messages, messagesStatus } =
    useSelector((state) => state.chat);

  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  useEffect(() => {
    const newConvFromNav = location.state?.newConversation;
    if (newConvFromNav) {
      const existingConv = conversations.find(
        (c) => c._id === newConvFromNav._id
      );
      if (!existingConv) {
        dispatch(fetchConversations()).then(() => {
          setSelectedConversation(newConvFromNav);
        });
      } else {
        handleSelectConversation(newConvFromNav);
      }
    }
  }, [location.state, conversations, dispatch]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchQuery.trim() !== "") {
        setIsSearching(true);
        const fetchFriends = async () => {
          try {
            // Gọi API tìm kiếm bạn bè
            const { data } = await api.get(
              `/users/friends/search?q=${searchQuery}`
            );
            setSearchResults(data);
          } catch (error) {
            console.error("Failed to search friends:", error);
            setSearchResults([]);
          } finally {
            setIsSearching(false);
          }
        };
        fetchFriends();
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  useEffect(() => {
    if (socket && selectedConversation) {
      socket.on("newMessage", (message) => {
        const otherUser = selectedConversation.participants.find(
          (p) => p._id !== userInfo._id
        );
        if (message.senderId === otherUser?._id) {
          dispatch(addMessage(message));
        }
      });
      return () => socket.off("newMessage");
    }
  }, [socket, dispatch, selectedConversation, userInfo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = (conv) => {
    setSelectedConversation(conv);
    const otherUser = conv.participants.find((p) => p._id !== userInfo._id);
    if (otherUser) {
      dispatch(fetchMessages(otherUser._id));
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const otherUser = selectedConversation.participants.find(
      (p) => p._id !== userInfo._id
    );
    const receiverId = otherUser._id;

    const messageData = {
      senderId: userInfo._id,
      receiverId,
      content: newMessage,
      createdAt: new Date().toISOString(),
    };

    dispatch(addMessage(messageData));
    setNewMessage("");

    try {
      await api.post(`/messages/send/${receiverId}`, { content: newMessage });
    } catch (error) {
      console.error("Failed to send message", error);
    }
  };

  const handleStartConversation = async (user) => {
    try {
      // Gọi API để tìm hoặc tạo cuộc trò chuyện mới
      const { data: newConversation } = await api.post(
        "/messages/findOrCreate",
        {
          receiverId: user._id,
        }
      );

      dispatch(addOrUpdateConversation(newConversation));

      handleSelectConversation(newConversation);

      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      console.error("Error starting conversation:", error);
    }
  };

  const otherUserInSelectedConv = selectedConversation?.participants.find(
    (p) => p._id !== userInfo._id
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex border border-border rounded-2xl bg-card overflow-hidden">
      {/* Cột trái */}
      <div className="w-1/3 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search friends to chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {searchQuery.trim() ? (
            // 1. Nếu đang có tìm kiếm
            <div className="p-2">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground px-2 mb-2">
                Search Results
              </h3>
              {isSearching ? (
                <Skeleton className="h-20 w-full rounded-lg" />
              ) : searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <SearchUserCard
                    key={user._id}
                    user={user}
                    onSelect={handleStartConversation} // Truyền hàm xử lý vào
                  />
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground p-4">
                  No friends found.
                </p>
              )}
            </div>
          ) : (
            // 2. Nếu không tìm kiếm, hiển thị danh sách conversation
            <div>
              {conversationsStatus === "loading" && (
                <Skeleton className="h-full w-full" />
              )}
              {conversationsStatus === "succeeded" &&
                conversations.map((conv) => {
                  const otherUser = conv.participants.find(
                    (p) => p._id !== userInfo._id
                  );
                  if (!otherUser) return null;
                  return (
                    <div
                      key={conv._id}
                      onClick={() => handleSelectConversation(conv)}
                      className={cn(
                        "p-4 flex items-center gap-4 cursor-pointer hover:bg-secondary/50 transition-colors border-b border-border/50",
                        selectedConversation?._id === conv._id && "bg-secondary"
                      )}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={otherUser.avatar} />
                        <AvatarFallback>
                          {otherUser.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold">{otherUser.username}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.messages[0]?.content}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Cột phải */}
      <div className="w-2/3 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="p-4 border-b border-border flex items-center gap-4">
              <Avatar>
                <AvatarImage src={otherUserInSelectedConv?.avatar} />
                <AvatarFallback>
                  {otherUserInSelectedConv?.username[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">
                {otherUserInSelectedConv?.username}
              </h3>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-secondary/20">
              {messagesStatus === "loading" && <p>Loading messages...</p>}
              {messagesStatus === "succeeded" &&
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex",
                      msg.senderId === userInfo._id
                        ? "justify-end"
                        : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                        msg.senderId === userInfo._id
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border"
                      )}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border bg-card">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="h-11"
                />
                <Button type="submit" size="lg">
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessengerPage;
